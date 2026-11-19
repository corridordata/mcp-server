export interface RunActorOptions {
  actorSlug: string;
  input: Record<string, unknown>;
  apifyToken?: string;
  maxTotalChargeUsd?: number;
  timeoutSecs?: number;
  fetchImpl?: typeof fetch;
}

export interface RunActorResult {
  actor: string;
  count: number;
  items: unknown[];
}

export class ApifyCallerError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApifyCallerError";
    this.statusCode = statusCode;
  }
}

/**
 * Invokes `corridordata/<actorSlug>` synchronously via Apify API v2 using the
 * caller's personal `APIFY_TOKEN` so Pay-Per-Event (`result-item`) charges
 * bill directly to the caller's Apify account (including Free-tier credits).
 */
export async function runCorridorActor(opts: RunActorOptions): Promise<RunActorResult> {
  const token = (opts.apifyToken ?? process.env.APIFY_TOKEN ?? "").trim();
  if (!token) {
    throw new ApifyCallerError(
      "Missing APIFY_TOKEN environment variable. Create a free or paid token at https://console.apify.com/settings/integrations and pass APIFY_TOKEN in your MCP server env configuration."
    );
  }

  const fetchFn = opts.fetchImpl ?? globalThis.fetch;
  const timeoutSecs = opts.timeoutSecs ?? 180;
  const envCap = process.env.APIFY_MAX_TOTAL_CHARGE_USD
    ? Number(process.env.APIFY_MAX_TOTAL_CHARGE_USD)
    : undefined;
  const chargeCap = opts.maxTotalChargeUsd ?? (Number.isFinite(envCap) ? envCap : undefined);

  const url = new URL(
    `https://api.apify.com/v2/acts/corridordata~${opts.actorSlug}/run-sync-get-dataset-items`
  );
  url.searchParams.set("format", "json");
  url.searchParams.set("clean", "true");
  url.searchParams.set("timeout", String(timeoutSecs));
  if (typeof chargeCap === "number" && chargeCap > 0) {
    url.searchParams.set("maxTotalChargeUsd", String(chargeCap));
  }

  // Strip undefined properties from input payload
  const cleanInput: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(opts.input)) {
    if (v !== undefined) {
      cleanInput[k] = v;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), (timeoutSecs + 15) * 1000);

  try {
    const res = await fetchFn(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "@corridordata/mcp-server/1.0.0",
      },
      body: JSON.stringify(cleanInput),
      signal: controller.signal,
    });

    const rawText = await res.text();
    if (!res.ok) {
      let detail = rawText.slice(0, 400);
      try {
        const errJson = JSON.parse(rawText) as { error?: { message?: string; type?: string } };
        if (errJson?.error?.message) {
          detail = `${errJson.error.type ?? "apify_error"}: ${errJson.error.message}`;
        }
      } catch {
        // keep raw snippet
      }
      throw new ApifyCallerError(
        `Apify Actor corridordata/${opts.actorSlug} returned HTTP ${res.status}: ${detail}`,
        res.status
      );
    }

    const parsed = rawText ? (JSON.parse(rawText) as unknown) : [];
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return {
      actor: `corridordata/${opts.actorSlug}`,
      count: items.length,
      items,
    };
  } finally {
    clearTimeout(timer);
  }
}
