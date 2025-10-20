## Explorium Adapter Agent

Role: Strict adapter spec for Explorium MCP. Wraps HTTP calls, enforces schema, retries, and rate limits. No UI logic.

Responsibilities
- Build payloads from parsed requirements; never from raw user text.
- Enforce U.S.-only filter and NAICS whitelist.
- Hardened fetch: timeouts (8s), 429/5xx backoff (jittered exp), circuit breaker after 5 failures.
- Redact secrets from logs.

Inputs
```ts
export interface ExploriumQuery {
  natural_language_query: string; // echo original for recall, not for filtering
  filters: {
    country: 'United States';
    naics_codes: string[]; // ["331110","331222","332721",...]
    employee_count_min?: number; // >= 10
    state?: string; // e.g., "TX"
  };
  required_signals: string[]; // ["has_website","employee_count_10_plus","cnc_capability"]
  optional_signals?: string[]; // ["iso_9001","as9100","recycled_content","carbon_intensity"]
}
```

Outputs
```ts
export interface ExploriumSupplier {
  company_name: string;
  hq_location: string; // City, ST
  website?: string;
  signals: Record<string, unknown>; // raw enriched signals
}
```

Error Policy
- Map transport and 4xx/5xx to canonical codes (see `rules/03_api_contracts.md`).
- Never throw raw; return `{ ok:false, code, message }` with `diagnostics.requestId`.

Non-Goals: scoring, formatting, user prompts.


