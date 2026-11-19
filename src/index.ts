#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ApifyCallerError, runCorridorActor } from "./apifyClient.js";
import { CORRIDOR_TOOLS } from "./tools.js";

export interface ServerConfig {
  apifyToken?: string;
  enabledTools?: string[];
  fetchImpl?: typeof fetch;
}

export const SERVER_VERSION = "1.0.0";

export function createCorridorMcpServer(config: ServerConfig = {}): McpServer {
  const server = new McpServer({
    name: "corridordata-mcp",
    version: SERVER_VERSION,
  });

  const allowSet =
    config.enabledTools && config.enabledTools.length > 0
      ? new Set(config.enabledTools.map((t) => t.trim()))
      : null;

  for (const spec of CORRIDOR_TOOLS) {
    if (allowSet && !allowSet.has(spec.name) && !allowSet.has(spec.actorSlug)) {
      continue;
    }

    server.tool(
      spec.name,
      spec.description,
      spec.shape,
      {
        title: spec.title,
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      async (rawArgs) => {
        const { maxTotalChargeUsd, ...actorInput } = rawArgs as Record<string, unknown> & {
          maxTotalChargeUsd?: number;
        };

        try {
          const result = await runCorridorActor({
            actorSlug: spec.actorSlug,
            input: actorInput,
            apifyToken: config.apifyToken,
            maxTotalChargeUsd,
            fetchImpl: config.fetchImpl,
          });

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (err) {
          const msg =
            err instanceof ApifyCallerError || err instanceof Error
              ? err.message
              : String(err);
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: msg,
              },
            ],
          };
        }
      }
    );
  }

  return server;
}

function parseCliArgs(argv: string[]): { help: boolean; version: boolean; tools?: string[] } {
  let help = false;
  let version = false;
  let tools: string[] | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      help = true;
    } else if (arg === "--version" || arg === "-v") {
      version = true;
    } else if (arg === "--tools" && argv[i + 1]) {
      tools = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (arg.startsWith("--tools=")) {
      tools = arg.slice("--tools=".length).split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  return { help, version, tools };
}

export async function main(): Promise<void> {
  const { help, version, tools } = parseCliArgs(process.argv.slice(2));

  if (version) {
    process.stdout.write(`@corridordata/mcp-server v${SERVER_VERSION}\n`);
    return;
  }

  if (help) {
    const toolLines = CORRIDOR_TOOLS.map(
      (t) => `  - ${t.name.padEnd(32)} -> corridordata/${t.actorSlug}`
    ).join("\n");
    process.stdout.write(
      `@corridordata/mcp-server v${SERVER_VERSION}\n\n` +
        `Usage:\n  APIFY_TOKEN=<your_token> npx -y @corridordata/mcp-server [--tools tool1,tool2]\n\n` +
        `Available MCP Tools (${CORRIDOR_TOOLS.length}):\n${toolLines}\n`
    );
    return;
  }

  const server = createCorridorMcpServer({ enabledTools: tools });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const isDirectExecution = (() => {
  try {
    if (!process.argv[1]) return false;
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();

if (isDirectExecution) {
  main().catch((err) => {
    process.stderr.write(`Fatal error in @corridordata/mcp-server: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
}

export { CORRIDOR_TOOLS, runCorridorActor, ApifyCallerError };
