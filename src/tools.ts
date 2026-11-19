import { z, type ZodRawShape } from "zod";

export interface CorridorToolSpec {
  name: string;
  title: string;
  actorSlug: string;
  description: string;
  shape: ZodRawShape;
}

const maxChargeField = z
  .number()
  .positive()
  .optional()
  .describe(
    "Optional per-run USD spend cap forwarded to Apify Pay-Per-Event billing (`maxTotalChargeUsd`)."
  );

export const CORRIDOR_TOOLS: CorridorToolSpec[] = [
  {
    name: "search_remote_hiring_signals",
    title: "Search Global Remote Hiring Signals & Company Domains",
    actorSlug: "global-remote-hiring-signals",
    description:
      "Find deduplicated B2B companies actively hiring remote, cross-border, LATAM, Europe, EMEA, and APAC talent across 6 live feeds with verified root company domains (`domain`), careers URLs, disclosed salary ranges, tech stack, and hiring velocity (`corridordata/global-remote-hiring-signals`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(20)
        .describe("Maximum number of deduplicated hiring company leads to return."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Optional role, skill, or tech stack keywords (OR logic, e.g. ['python', 'ai', 'devops'])."),
      targetRegions: z
        .array(z.enum(["Worldwide", "LATAM", "Europe", "APAC", "EMEA", "US / Canada", "UK"]))
        .optional()
        .describe("Filter companies hiring in specific remote regions."),
      crossBorderOnly: z
        .boolean()
        .default(true)
        .describe("Exclude single-country domestic remote roles (e.g. 'US Only') to isolate cross-border / EOR hiring signals."),
      postedWithinDays: z
        .number()
        .int()
        .min(1)
        .max(90)
        .default(14)
        .describe("Only include fresh postings published within the last N days."),
      minOpenRoles: z
        .number()
        .int()
        .min(1)
        .default(1)
        .describe("Minimum active remote job openings at the same company."),
      withSalaryOnly: z
        .boolean()
        .default(false)
        .describe("Only return companies with disclosed salary ranges."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_funded_startups",
    title: "Search SEC Form D Newly Funded Startups & Executives",
    actorSlug: "sec-form-d-startup-funding-leads",
    description:
      "Extract newly funded US and cross-border startups from official SEC EDGAR Form D XML filings with USD raised, pooled hedge-fund/real-estate filtering, resolved company domains, and CEO/Founder/Director names (`corridordata/sec-form-d-startup-funding-leads`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(20)
        .describe("Maximum number of funded startup Form D records to return."),
      filedWithinDays: z
        .number()
        .int()
        .min(1)
        .max(90)
        .default(7)
        .describe("Lookback window in days for SEC EDGAR Form D filings."),
      excludePooledFundsAndRealEstate: z
        .boolean()
        .default(true)
        .describe("Exclude hedge funds, PE vehicles, and real estate syndications."),
      techAndHealthcareOnly: z
        .boolean()
        .default(false)
        .describe("Restrict to Technology, SaaS, AI, Biotech, Pharmaceuticals, and Healthcare issuers."),
      minAmountRaisedUsd: z
        .number()
        .min(0)
        .default(0)
        .describe("Minimum USD sold/offering amount (e.g. 500000 for Seed/Series A+)."),
      states: z
        .array(z.string())
        .optional()
        .describe("Optional 2-letter US state codes (e.g. ['CA', 'NY', 'TX', 'MA'])."),
      enrichCompanyDomain: z
        .boolean()
        .default(true)
        .describe("Automatically resolve root company website domains."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_global_tenders",
    title: "Search World Bank, UNGM, UNDP & EU TED Tenders",
    actorSlug: "multilateral-development-tenders",
    description:
      "Search live multilateral procurement tenders, RFPs, EOIs, and contract awards (including winning suppliers and award prices) across World Bank, UNGM (32+ UN Agencies), UNDP, and EU TED (`corridordata/multilateral-development-tenders`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(20)
        .describe("Maximum procurement or contract-award notices to return."),
      sources: z
        .array(z.enum(["worldbank", "ungm", "undp", "ted_eu"]))
        .optional()
        .describe("Multilateral portals to query in parallel (defaults to all 4)."),
      recordMode: z
        .enum(["all", "open_tenders", "contract_awards"])
        .default("open_tenders")
        .describe("Return open bidding opportunities, awarded contracts, or all notices."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Sector or technical keywords (e.g. ['software', 'cloud', 'advisory', 'solar'])."),
      countries: z
        .array(z.string())
        .optional()
        .describe("Target country names (e.g. ['Philippines', 'India', 'Kenya', 'Spain'])."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "extract_saas_pricing",
    title: "Extract Structured SaaS Pricing Tiers & Billing Models",
    actorSlug: "saas-pricing-page-structured-extractor",
    description:
      "Convert any SaaS root domain or `/pricing` URL into structured JSON pricing tiers, monthly/annual prices, free-plan availability, per-seat vs. usage-based billing flags, and clean LLM-ready Markdown (`corridordata/saas-pricing-page-structured-extractor`).",
    shape: {
      urls: z
        .array(z.string().min(3))
        .min(1)
        .max(50)
        .describe("List of SaaS pricing URLs or domains (e.g. ['https://linear.app/pricing', 'https://resend.com/pricing'])."),
      includeCleanMarkdown: z
        .boolean()
        .default(true)
        .describe("Include token-efficient Markdown of the pricing page alongside structured tier JSON."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "scan_b2b_trust_soc2",
    title: "Audit B2B Domain SOC2 Trust Centers & DNS SaaS Stack",
    actorSlug: "b2b-trust-soc2-dns-stack-scanner",
    description:
      "Audit B2B company domains for SOC 2 / ISO 27001 / HIPAA Trust Centers (Vanta, Drata, Sprinto, SafeBase, Conveyor), `security.txt`, DMARC email spoofing risk, and internal DNS SaaS stack via SPF/TXT/MX records (`corridordata/b2b-trust-soc2-dns-stack-scanner`).",
    shape: {
      domains: z
        .array(z.string().min(3))
        .min(1)
        .max(200)
        .describe("Company domains or URLs to audit in parallel (e.g. ['linear.app', 'resend.com', 'cal.com'])."),
      probeTrustSubdomains: z
        .boolean()
        .default(true)
        .describe("Probe trust.<domain>, security.<domain>, /trust, /security, and /.well-known/security.txt."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_apac_jobs",
    title: "Search JobStreet, JobsDB & SEEK APAC Job Listings",
    actorSlug: "jobstreet-jobsdb-apac-scraper",
    description:
      "Search active APAC job listings, hiring companies, and disclosed salary bands across JobStreet, JobsDB, and SEEK covering Singapore (SG), Malaysia (MY), Philippines (PH), Indonesia (ID), Hong Kong (HK), Thailand (TH), Australia (AU), and New Zealand (NZ) (`corridordata/jobstreet-jobsdb-apac-scraper`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum APAC job listings to return."),
      countries: z
        .array(z.enum(["SG", "MY", "PH", "ID", "HK", "TH", "AU", "NZ"]))
        .default(["SG", "MY", "HK", "PH"])
        .describe("APAC market portals to query in parallel."),
      keywords: z
        .string()
        .default("software engineer")
        .describe("Search query for role, skill, or employer name."),
      location: z
        .string()
        .optional()
        .describe("Optional city or sub-region filter (e.g. 'Kuala Lumpur', 'Makati', 'Central')."),
      postedWithinDays: z
        .number()
        .int()
        .min(1)
        .max(60)
        .default(14)
        .describe("Only include listings posted within the last N days."),
      workArrangement: z
        .enum(["all", "Remote", "Hybrid", "On-site"])
        .default("all")
        .describe("Optional Remote / Hybrid / On-site filter."),
      withSalaryOnly: z
        .boolean()
        .default(false)
        .describe("Only return listings with publicly stated salary bands."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_spain_public_tenders",
    title: "Search Spain Public Tenders & Awards (PLACSP Contratación)",
    actorSlug: "spain-public-tenders-contratacion",
    description:
      "Parse Spain's official Plataforma de Contratación del Sector Público (PLACSP CODICE Atom feeds) into clean JSON: open public tenders (`licitaciones`), minor contracts (`contratos menores`), CPV codes, EUR budgets, and winning NIF contract awards (`corridordata/spain-public-tenders-contratacion`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum Spanish public tender or award notices to return."),
      feedType: z
        .enum(["licitaciones", "contratos_menores"])
        .default("licitaciones")
        .describe("General contracting profiles (`licitaciones`) or SME minor contracts (`contratos_menores`)."),
      statusFilter: z
        .enum(["all", "open_only", "awarded_only"])
        .default("open_only")
        .describe("Filter for open tenders (`open_only`), awarded contracts (`awarded_only`), or all."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Spanish or English keywords matched against contract title or authority."),
      cpvPrefixes: z
        .array(z.string())
        .optional()
        .describe("CPV code prefixes (e.g. ['72'] for IT/Software, ['79'] for Consulting, ['45'] for Construction)."),
      region: z
        .string()
        .optional()
        .describe("Optional city, province, or Autonomous Community substring (e.g. 'Madrid', 'Barcelona')."),
      minBudgetEur: z
        .number()
        .min(0)
        .default(0)
        .describe("Minimum tax-exclusive budget in EUR."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_uk_france_tenders",
    title: "Search UK Contracts Finder & France BOAMP Public Tenders",
    actorSlug: "uk-france-public-tenders-ocds",
    description:
      "Query UK Contracts Finder (OCDS) and France BOAMP government procurement tenders and contract awards with buyer contact emails, CPV codes, deadlines, GBP/EUR values, and awarded suppliers (`corridordata/uk-france-public-tenders-ocds`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum UK/French procurement notices to return."),
      countries: z
        .array(z.enum(["UK", "FR"]))
        .default(["UK", "FR"])
        .describe("Portals to query: UK (Contracts Finder), FR (BOAMP), or both."),
      recordMode: z
        .enum(["all", "open_tenders", "contract_awards"])
        .default("open_tenders")
        .describe("Filter open tenders, awarded contracts, or all notices."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("English or French sector keywords (e.g. ['software', 'logiciel', 'cloud', 'cyber'])."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_spain_boe_grants",
    title: "Search Spain BOE Subvenciones, Grants & BORME Registry",
    actorSlug: "spain-boe-borme-grants-signals",
    description:
      "Extract official Spanish government grants and subsidies (`BOE Subvenciones / Ayudas`), official announcements, and provincial corporate registry acts (`BORME Registro Mercantil`) via BOE Datos Abiertos (`corridordata/spain-boe-borme-grants-signals`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum BOE/BORME items to return."),
      sources: z
        .array(z.enum(["boe_grants", "boe_tenders", "borme_registry"]))
        .default(["boe_grants", "borme_registry"])
        .describe("Official Spanish bulletins to scan."),
      daysBack: z
        .number()
        .int()
        .min(1)
        .max(14)
        .default(3)
        .describe("Recent business days to scan."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Spanish keywords, ministries, or provinces (e.g. ['subvenciones', 'digitalización', 'Madrid'])."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_sec_8k_nih_triggers",
    title: "Search SEC 8-K Executive/M&A Events & NIH Biotech Grants",
    actorSlug: "sec-8k-nih-enterprise-triggers",
    description:
      "Track real-time SEC Form 8-K enterprise buying triggers (Item 5.02 C-suite changes, Item 2.01 M&A closings, Item 1.01 material contracts) and commercial NIH SBIR/STTR biotech grant awards (`corridordata/sec-8k-nih-enterprise-triggers`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum corporate or biotech trigger signals to return."),
      sources: z
        .array(z.enum(["sec_8k", "nih_grants"]))
        .default(["sec_8k", "nih_grants"])
        .describe("Trigger feeds to query."),
      sec8kItemCodes: z
        .array(z.string())
        .optional()
        .describe("SEC 8-K item codes (e.g. ['5.02', '2.01', '1.01'])."),
      commercialBiotechSbirOnly: z
        .boolean()
        .default(true)
        .describe("Restrict NIH grants to commercial private-sector SBIR/STTR biotech companies."),
      daysBack: z
        .number()
        .int()
        .min(1)
        .max(30)
        .default(5)
        .describe("SEC 8-K lookback window in days."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_multi_ats_jobs",
    title: "Search Ashby, Greenhouse, Lever, Workable & SmartRecruiters Boards",
    actorSlug: "multi-ats-startup-jobs-enricher",
    description:
      "Extract normalized job openings across Ashby, Greenhouse, Lever, Workable, and SmartRecruiters career boards with departments, remote flags, compensation bands, and direct apply links (`corridordata/multi-ats-startup-jobs-enricher`).",
    shape: {
      boards: z
        .array(z.string().min(3))
        .min(1)
        .describe("ATS board URLs or `provider:slug` identifiers (e.g. ['ashby:linear', 'greenhouse:cloudflare', 'lever:palantir'])."),
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(30)
        .describe("Maximum normalized ATS job postings to return."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Optional role, department, or location keywords."),
      remoteOnly: z
        .boolean()
        .default(false)
        .describe("Only return roles explicitly marked Remote."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_clinical_trial_sponsors",
    title: "Search ClinicalTrials.gov Biotech & Pharma Trial Sponsors",
    actorSlug: "clinicaltrials-biotech-sponsor-leads",
    description:
      "Find commercial biotech, pharma, and medtech companies running Phase 1–4 clinical trials via ClinicalTrials.gov v2 API with central study contact emails, phones, and company domains (`corridordata/clinicaltrials-biotech-sponsor-leads`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum clinical trial sponsor leads to return."),
      industrySponsorsOnly: z
        .boolean()
        .default(true)
        .describe("Restrict to commercial biotech/pharma/medtech sponsors (exclude universities/NIH)."),
      conditionOrKeyword: z
        .string()
        .optional()
        .describe("Disease, therapeutic area, or drug modality (e.g. 'oncology', 'GLP-1', 'CAR-T')."),
      statuses: z
        .array(z.enum(["NOT_YET_RECRUITING", "RECRUITING", "ACTIVE_NOT_RECRUITING", "COMPLETED"]))
        .default(["NOT_YET_RECRUITING", "RECRUITING"])
        .describe("Trial recruitment statuses to include."),
      withContactEmailOnly: z
        .boolean()
        .default(false)
        .describe("Only return trials listing a direct central contact email."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_eu_horizon_grants",
    title: "Search EU Horizon Europe Grants & SEDIA Funding Calls",
    actorSlug: "eu-horizon-grants-funding-calls",
    description:
      "Search open and forthcoming European Commission grants and tenders (Horizon Europe, Digital Europe, EIC, LIFE, EDF) via SEDIA API with parsed EUR topic budgets and submission deadlines (`corridordata/eu-horizon-grants-funding-calls`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum EU funding calls or tenders to return."),
      searchKeyword: z
        .string()
        .optional()
        .describe("Technology or topic keyword (e.g. 'AI', 'quantum', 'cybersecurity', 'hydrogen')."),
      statuses: z
        .array(z.enum(["OPEN", "FORTHCOMING", "CLOSED"]))
        .default(["OPEN", "FORTHCOMING"])
        .describe("Call statuses to include."),
      opportunityTypes: z
        .array(z.enum(["GRANTS", "TENDERS"]))
        .default(["GRANTS", "TENDERS"])
        .describe("Include EU Grants, EU Tenders, or both."),
      minBudgetEur: z
        .number()
        .min(0)
        .default(0)
        .describe("Minimum parsed topic budget in EUR."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "search_us_federal_awards",
    title: "Search USAspending Federal Contract & Grant Awards",
    actorSlug: "usaspending-federal-contract-awards",
    description:
      "Find companies that recently won US federal prime contracts or grants via USAspending.gov v2 API filtered by keyword, NAICS code, and minimum USD value with enriched company domains (`corridordata/usaspending-federal-contract-awards`).",
    shape: {
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(25)
        .describe("Maximum federal contract or grant award records to return."),
      awardCategory: z
        .enum(["contracts", "grants"])
        .default("contracts")
        .describe("Query prime Federal Contracts or Federal Grants."),
      keywords: z
        .array(z.string())
        .optional()
        .describe("Keywords matched against award descriptions (e.g. ['cybersecurity', 'cloud'])."),
      naicsCodes: z
        .array(z.string())
        .optional()
        .describe("Optional 2-to-6 digit NAICS prefixes (e.g. ['541511', '541512'])."),
      minAwardAmountUsd: z
        .number()
        .min(0)
        .default(100000)
        .describe("Minimum obligated award amount in USD."),
      daysBack: z
        .number()
        .int()
        .min(1)
        .max(365)
        .default(90)
        .describe("Lookback window in days."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
  {
    name: "monitor_saas_changelogs",
    title: "Monitor B2B SaaS Sitemaps, Changelogs & Product Launches",
    actorSlug: "b2b-sitemap-changelog-launch-monitor",
    description:
      "Inspect target B2B SaaS XML sitemaps and RSS/Atom feeds to detect recent changelog releases, pricing/enterprise page updates, new integrations, and product launches (`corridordata/b2b-sitemap-changelog-launch-monitor`).",
    shape: {
      domains: z
        .array(z.string().min(3))
        .min(1)
        .max(100)
        .describe("Target SaaS domains to inspect (e.g. ['resend.com', 'linear.app', 'posthog.com'])."),
      maxItems: z
        .number()
        .int()
        .min(1)
        .max(500)
        .default(30)
        .describe("Maximum classified launch/changelog URLs to return."),
      signalCategories: z
        .array(
          z.enum([
            "CHANGELOG_RELEASE",
            "PRICING_OR_ENTERPRISE",
            "INTEGRATION_OR_DOCS",
            "BLOG_OR_CASE_STUDY",
            "PRODUCT_OR_SECURITY",
          ])
        )
        .optional()
        .describe("Filter specific GTM / competitive-intelligence URL categories."),
      daysBack: z
        .number()
        .int()
        .min(0)
        .max(365)
        .default(0)
        .describe("Only include entries modified within the last N days (0 = no cutoff)."),
      maxTotalChargeUsd: maxChargeField,
    },
  },
];
