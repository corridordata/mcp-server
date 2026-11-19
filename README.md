# `@corridordata/mcp-server`

Official **Model Context Protocol (MCP)** server for [**Corridor Data**](https://apify.com/corridordata)—giving **Claude Desktop**, **Cursor**, **Windsurf**, **VS Code**, **Cline**, and **OpenAI / LangChain AI Agents** instant, schema-validated access to **20 real-time B2B buying-trigger, startup funding, FDA medtech, GLEIF corporate formation, public procurement, federal grants, regulatory rulemaking, remote hiring, SOC 2 compliance, and SaaS pricing datasets** on Apify.

- **Zero Browser Overhead (`128 MB` Containers):** Every Corridor Data Actor runs against structured APIs, XML/Atom feeds, and DNS/SSR endpoints in **1–4 seconds** with **zero residential proxies required**.
- **Bring Your Own `APIFY_TOKEN` (Risk-Free Free Tier + Pay-Per-Event):** Every tool call executes directly under your own Apify API token (`$5/month` free Apify platform credits included on Apify Free plans; transparent per-record Pay-Per-Event pricing with optional `maxTotalChargeUsd` spend caps).

---

## Quick Start

### 1. Claude Desktop (`claude_desktop_config.json`)

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "corridordata": {
      "command": "npx",
      "args": ["-y", "@corridordata/mcp-server"],
      "env": {
        "APIFY_TOKEN": "YOUR_APIFY_TOKEN"
      }
    }
  }
}
```

> Get your free or paid `APIFY_TOKEN` at [`https://console.apify.com/settings/integrations`](https://console.apify.com/settings/integrations).

### 2. Cursor (`.cursor/mcp.json`) & Windsurf (`~/.codeium/windsurf/mcp_config.json`)

```json
{
  "mcpServers": {
    "corridordata": {
      "command": "npx",
      "args": ["-y", "@corridordata/mcp-server"],
      "env": {
        "APIFY_TOKEN": "YOUR_APIFY_TOKEN",
        "APIFY_MAX_TOTAL_CHARGE_USD": "1.00"
      }
    }
  }
}
```

### 3. Load Only Selected Tools (Optional `--tools` Flag)

To keep your agent's context window lean, pass `--tools` with a comma-separated subset of tool names:

```json
{
  "mcpServers": {
    "corridordata-gtm": {
      "command": "npx",
      "args": [
        "-y",
        "@corridordata/mcp-server",
        "--tools",
        "search_funded_startups,search_remote_hiring_signals,extract_saas_pricing,scan_b2b_trust_soc2"
      ],
      "env": {
        "APIFY_TOKEN": "YOUR_APIFY_TOKEN"
      }
    }
  }
}
```

---

## All 20 Typed MCP Tools Included

| MCP Tool Name | Underlying Apify Actor (`corridordata/<slug>`) | Primary B2B / Agent Use Case |
| :--- | :--- | :--- |
| **`search_funded_startups`** | [`sec-form-d-startup-funding-leads`](https://apify.com/corridordata/sec-form-d-startup-funding-leads) | Newly funded US tech & biotech startups from SEC EDGAR Form D XML filings with USD raised, resolved domains & executive names. |
| **`search_remote_hiring_signals`** | [`global-remote-hiring-signals`](https://apify.com/corridordata/global-remote-hiring-signals) | Deduplicated B2B companies hiring cross-border remote roles across 6 boards with domains, salaries & hiring velocity. |
| **`search_global_tenders`** | [`multilateral-development-tenders`](https://apify.com/corridordata/multilateral-development-tenders) | Live open RFPs, EOIs & contract awards across World Bank, UNGM (32+ UN Agencies), UNDP & EU TED. |
| **`extract_saas_pricing`** | [`saas-pricing-page-structured-extractor`](https://apify.com/corridordata/saas-pricing-page-structured-extractor) | Convert any SaaS `/pricing` URL into structured JSON tiers, monthly/annual prices, per-seat/usage flags & clean Markdown. |
| **`scan_b2b_trust_soc2`** | [`b2b-trust-soc2-dns-stack-scanner`](https://apify.com/corridordata/b2b-trust-soc2-dns-stack-scanner) | Audit company domains for SOC 2 / ISO 27001 Trust Centers (Vanta, Drata, Sprinto, SafeBase), DMARC posture & DNS SaaS stack. |
| **`search_apac_jobs`** | [`jobstreet-jobsdb-apac-scraper`](https://apify.com/corridordata/jobstreet-jobsdb-apac-scraper) | Active APAC job openings & salary bands across JobStreet, JobsDB & SEEK (`SG`, `MY`, `PH`, `ID`, `HK`, `TH`, `AU`, `NZ`). |
| **`search_spain_public_tenders`** | [`spain-public-tenders-contratacion`](https://apify.com/corridordata/spain-public-tenders-contratacion) | Spain PLACSP (`Contratación del Sector Público`) open tenders (`licitaciones`), CPV codes, EUR budgets & NIF contract awards. |
| **`search_uk_france_tenders`** | [`uk-france-public-tenders-ocds`](https://apify.com/corridordata/uk-france-public-tenders-ocds) | UK Contracts Finder (OCDS) & France BOAMP public procurement tenders, buyer emails, deadlines & awarded suppliers. |
| **`search_spain_boe_grants`** | [`spain-boe-borme-grants-signals`](https://apify.com/corridordata/spain-boe-borme-grants-signals) | Official Spanish public subsidies/grants (`BOE Subvenciones`) and provincial corporate registry acts (`BORME`). |
| **`search_sec_8k_nih_triggers`** | [`sec-8k-nih-enterprise-triggers`](https://apify.com/corridordata/sec-8k-nih-enterprise-triggers) | Real-time SEC Form 8-K C-suite changes (`5.02`), M&A closings (`2.01`), material contracts (`1.01`) & NIH SBIR biotech grants. |
| **`search_multi_ats_jobs`** | [`multi-ats-startup-jobs-enricher`](https://apify.com/corridordata/multi-ats-startup-jobs-enricher) | Unified career board scraper across Ashby, Greenhouse, Lever, Workable & SmartRecruiters with salary bands & apply URLs. |
| **`search_clinical_trial_sponsors`** | [`clinicaltrials-biotech-sponsor-leads`](https://apify.com/corridordata/clinicaltrials-biotech-sponsor-leads) | Commercial biotech, pharma & medtech sponsors running Phase 1–4 trials via ClinicalTrials.gov v2 with central contact emails. |
| **`search_eu_horizon_grants`** | [`eu-horizon-grants-funding-calls`](https://apify.com/corridordata/eu-horizon-grants-funding-calls) | Open & forthcoming EU Horizon Europe, Digital Europe, EIC, LIFE & EDF grants and tenders with EUR budgets & deadlines. |
| **`search_us_federal_awards`** | [`usaspending-federal-contract-awards`](https://apify.com/corridordata/usaspending-federal-contract-awards) | Recent US federal prime contract & grant awards via USAspending.gov v2 filtered by keyword, NAICS & USD value. |
| **`monitor_saas_changelogs`** | [`b2b-sitemap-changelog-launch-monitor`](https://apify.com/corridordata/b2b-sitemap-changelog-launch-monitor) | Track competitor SaaS product launches, changelog releases, pricing updates & integrations via XML sitemaps and RSS/Atom. |
| **`search_fda_device_clearances`** | [`fda-510k-medtech-device-clearances`](https://apify.com/corridordata/fda-510k-medtech-device-clearances) | Newly FDA-cleared 510(k) and PMA Class III medical devices via openFDA with applicant domains, product codes & review days. |
| **`search_new_lei_entities`** | [`gleif-new-lei-entity-formations`](https://apify.com/corridordata/gleif-new-lei-entity-formations) | Newly issued global Legal Entity Identifiers (LEIs) from GLEIF with incorporation date, legal form, registry number & parent links. |
| **`search_us_grants_gov`** | [`grants-gov-federal-funding-opportunities`](https://apify.com/corridordata/grants-gov-federal-funding-opportunities) | Open & forecasted US federal grants on Grants.gov with award ceilings, total funding, CFDA listings & program officer emails. |
| **`search_hn_hiring_startups`** | [`hn-whos-hiring-startup-leads`](https://apify.com/corridordata/hn-whos-hiring-startup-leads) | Structured startup hiring leads from monthly 'Ask HN: Who is hiring?' threads with domain, remote/visa flags, salary & tech stack. |
| **`search_federal_register`** | [`federal-register-regulatory-signals`](https://apify.com/corridordata/federal-register-regulatory-signals) | US Federal Register final rules, proposed rules (NPRMs) & notices with open public comment deadlines, CFR citations & EO 12866 flags. |

---

## Example Prompts for Claude / Cursor

- **Venture & Outbound Prospecting:**  
  *"Use `search_funded_startups` to find 20 US tech and biotech startups that raised $1M+ in SEC Form D filings over the last 7 days, then run `scan_b2b_trust_soc2` on their domains to see which ones don't have Vanta or Drata yet."*
- **Competitive SaaS Pricing Teardown:**  
  *"Call `extract_saas_pricing` on `linear.app`, `asana.com`, and `clickup.com` and build a comparison table of entry monthly seat price, free tier availability, and enterprise gating."*
- **Global & European Public Sector Capture:**  
  *"Search `search_global_tenders` and `search_uk_france_tenders` for open cybersecurity and cloud migration RFPs closing next month."*
- **Cross-Border EOR & Staffing Signals:**  
  *"Find 25 companies hiring cross-border remote engineers in Europe or LATAM this week using `search_remote_hiring_signals` with disclosed salaries."*

---

## Directory Listings & Manifests (`mcp.so`, `smithery.ai`, `glama.ai/mcp/servers`)

This repository includes native discovery manifests out of the box:
- **`smithery.yaml`** — Ready for one-click listing & hosted/stdio configuration on [**Smithery.ai**](https://smithery.ai).
- **`glama.json`** — Verified maintainer schema for [**Glama MCP Directory**](https://glama.ai/mcp/servers).
- **MCP.so / PulseMCP / Official MCP Registry:** Submit GitHub repo URL `https://github.com/corridordata/mcp-server` (`npx -y @corridordata/mcp-server`).

---

## Local Development & Testing

```bash
git clone https://github.com/corridordata/mcp-server.git
cd mcp-server
npm install
npm test
```

---

## License

MIT © [Corridor Data](https://apify.com/corridordata)
