import assert from "node:assert/strict";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CORRIDOR_TOOLS, createCorridorMcpServer } from "../dist/index.js";

test("registers all 20 typed Corridor Data MCP tools with valid JSON schemas", async () => {
  const server = createCorridorMcpServer({ apifyToken: "test_token_123" });
  const client = new Client({ name: "corridor-test-client", version: "1.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const { tools } = await client.listTools();
  assert.equal(tools.length, 20);
  assert.equal(CORRIDOR_TOOLS.length, 20);

  const names = new Set(tools.map((t) => t.name));
  for (const required of [
    "search_funded_startups",
    "search_remote_hiring_signals",
    "search_global_tenders",
    "extract_saas_pricing",
    "scan_b2b_trust_soc2",
    "search_apac_jobs",
    "search_spain_public_tenders",
    "search_uk_france_tenders",
    "search_spain_boe_grants",
    "search_sec_8k_nih_triggers",
    "search_multi_ats_jobs",
    "search_clinical_trial_sponsors",
    "search_eu_horizon_grants",
    "search_us_federal_awards",
    "monitor_saas_changelogs",
    "search_fda_device_clearances",
    "search_new_lei_entities",
    "search_us_grants_gov",
    "search_hn_hiring_startups",
    "search_federal_register",
  ]) {
    assert.ok(names.has(required), `Expected MCP tool '${required}' to be registered`);
  }

  for (const tool of tools) {
    assert.equal(tool.inputSchema.type, "object");
    assert.ok(tool.description && tool.description.length > 40);
  }

  await client.close();
});

test("forwards caller APIFY_TOKEN Bearer header, maxTotalChargeUsd, and clean payload to Apify v2 endpoint", async () => {
  let capturedUrl = "";
  let capturedInit = null;

  const mockFetch = async (url, init) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(
      JSON.stringify([
        {
          company: "Acme Robotics Inc.",
          domain: "acmerobotics.ai",
          amountSoldUsd: 4200000,
        },
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  const server = createCorridorMcpServer({
    apifyToken: "caller_apify_token_xyz",
    fetchImpl: mockFetch,
  });
  const client = new Client({ name: "corridor-test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const response = await client.callTool({
    name: "search_funded_startups",
    arguments: {
      maxItems: 5,
      filedWithinDays: 7,
      techAndHealthcareOnly: true,
      minAmountRaisedUsd: 500000,
      maxTotalChargeUsd: 0.25,
    },
  });

  assert.ok(!response.isError);
  assert.ok(
    capturedUrl.startsWith(
      "https://api.apify.com/v2/acts/corridordata~sec-form-d-startup-funding-leads/run-sync-get-dataset-items?"
    )
  );
  assert.ok(capturedUrl.includes("maxTotalChargeUsd=0.25"));
  assert.equal(capturedInit.headers.Authorization, "Bearer caller_apify_token_xyz");

  const sentBody = JSON.parse(capturedInit.body);
  assert.equal(sentBody.maxItems, 5);
  assert.equal(sentBody.techAndHealthcareOnly, true);
  assert.equal("maxTotalChargeUsd" in sentBody, false);

  const payload = JSON.parse(response.content[0].text);
  assert.equal(payload.actor, "corridordata/sec-form-d-startup-funding-leads");
  assert.equal(payload.count, 1);
  assert.equal(payload.items[0].domain, "acmerobotics.ai");

  await client.close();
});

test("returns actionable isError message when APIFY_TOKEN is missing", async () => {
  const prev = process.env.APIFY_TOKEN;
  delete process.env.APIFY_TOKEN;

  try {
    const server = createCorridorMcpServer({});
    const client = new Client({ name: "corridor-test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const response = await client.callTool({
      name: "extract_saas_pricing",
      arguments: { urls: ["https://linear.app/pricing"] },
    });

    assert.equal(response.isError, true);
    assert.match(response.content[0].text, /Missing APIFY_TOKEN/);
    await client.close();
  } finally {
    if (prev !== undefined) process.env.APIFY_TOKEN = prev;
  }
});
