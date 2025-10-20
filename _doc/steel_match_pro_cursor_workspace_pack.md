# SteelMatch Pro — Cursor Workspace Pack

> Drop into repo root. All files are Markdown-first and Cursor-ready. Agents are **descriptive specs**, not autonomous substitutes for app logic.

```
.
├── agents/
│   ├── explorium_adapter_agent.md
│   ├── parsing_agent.md
│   ├── match_scoring_agent.md
│   ├── response_formatter_agent.md
│   └── triage_agent.md
├── docs/
│   ├── app_flow_document.md
│   ├── backend_structure_document.md
│   ├── implementation_plan.md
│   ├── project_requirements_document.md
│   └── tech_stack_document.md
└── rules/
    ├── 00_project_tenets.md
    ├── 01_security_and_secrets.md
    ├── 02_code_style_ts_react.md
    ├── 03_api_contracts.md
    ├── 04_data_governance.md
    ├── 05_performance_slo.md
    ├── 06_commit_conventions.md
    └── 07_testing_policy.md
```

---

## agents/explorium_adapter_agent.md

**Role**: Strict adapter spec for Explorium MCP. Wraps HTTP calls, enforces schema, retries, and rate limits. No UI logic.

**Responsibilities**
- Build payloads from parsed requirements; never from raw user text.
- Enforce **U.S.-only** filter and NAICS whitelist.
- Hardened fetch: timeouts (8s), 429/5xx backoff (jittered exp), circuit breaker after 5 failures.
- Redact secrets from logs.

**Inputs**
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

**Outputs**
```ts
export interface ExploriumSupplier {
  company_name: string;
  hq_location: string; // City, ST
  website?: string;
  signals: Record<string, unknown>; // raw enriched signals
}
```

**Error Policy**
- Map transport and 4xx/5xx to canonical codes (see `rules/03_api_contracts.md`).
- Never throw raw; return `{ ok:false, code, message }` with `diagnostics.requestId`.

**Non-Goals**: scoring, formatting, user prompts.

---

## agents/parsing_agent.md

**Role**: Deterministic extractor for material, tolerance, quantity/weight, delivery window, location.

**Method**
- Tiered parse: (1) fast regex, (2) rule-based normalization, (3) LLM fallback (guard-railed, temperature=0, schema constrained).
- Unit harmonization: inch/mm, lbs/kg → canonical SI/imperial duals.

**Schema**
```ts
export interface ParsedRequirements {
  material: { family: 'steel'|'aluminum'|'titanium'|'other'; grade?: string } | null;
  tolerance: { value: number; unit: 'in'|'mm' } | null;
  quantity: { value: number; unit: 'lbs'|'kg'|'units' } | null;
  delivery: { days?: number; weeks?: number } | null;
  location?: { state?: string; zip?: string } | null;
  capabilities?: string[]; // e.g., ['CNC milling','laser cutting']
  certifications?: string[]; // user-stated hard reqs
  missing: Array<'location'|'material'|'delivery'|'quantity'|'tolerance'>;
}
```

**Clarification Heuristics**
- If `location` missing → ask state/ZIP.
- If `delivery` ambiguous and lead-time critical → ask for latest acceptable ship date.

---

## agents/match_scoring_agent.md

**Role**: Convert adapter output + parsed reqs into rankable scores 0–100 with temperature buckets.

**Scoring v0 (MVP)**
```
score =
  + Certs:          +20 (ISO 9001 +10, AS9100 +10)
  + Lead-time fit:  +15 (≤ requested days → +15; ≤ 1.5x → +7; else 0)
  + Capability fit: +20 (exact CNC/laser/waterjet/welding matches)
  + Material/grade: +15 (exact grade +10; family match +5)
  + Sustainability: +10 (recycled_content% present → +5; carbon data → +5)
  + Activity:       +10 (hiring, recent tech signals)
  + Geography:      +10 (same-state +10; adjacent +5)
  - Penalties:      -X  (no website -10; employee_count <10 → hard fail)
```
**Temperature**
- Hot ≥ 85, Warm 65–84, Cold < 65.

**Outputs**
```ts
export interface RankedSupplier extends ExploriumSupplier {
  matchScore: number; // 0..100
  matchTemp: 'hot'|'warm'|'cold';
  reasons: string[]; // short bullets for UI cards
}
```

---

## agents/response_formatter_agent.md

**Role**: Deterministic, professional supplier cards + CTA block. No hallucination.

**Contract**
- Input: `RankedSupplier[]`, `ParsedRequirements`.
- Output: JSON payload used directly by UI; include concise rationale per card.

**Template (UI payload)**
```json
{
  "message": "Found 3 qualified U.S. manufacturers.",
  "suppliers": [
    {
      "company_name": "Midwest Precision Metals",
      "hq_location": "Cleveland, OH",
      "matchScore": 92,
      "matchTemp": "hot",
      "badges": ["ISO 9001","AS9100","10‑day lead"],
      "differentiators": ["CNC 5‑axis","Stainless focus"],
      "actions": { "visit": "https://…", "connect": true }
    }
  ],
  "cta": { "emailCapture": true, "calendly": true, "shareLink": true }
}
```

---

## agents/triage_agent.md

**Role**: Early request gate. Decide: (a) need clarification, (b) proceed match, (c) out-of-scope.

**Rules**
- Reject non-U.S. sourcing in MVP.
- If missing `location` → return clarification.
- If request is quoting/payment → route to CTA only.

---

## docs/project_requirements_document.md

> Canonicalized from your draft. Minor additions: hard fail rules, explicit metrics.

### Vision
AI-native matching of U.S. metals manufacturers using real-time B2B signals.

### Core Problem
Directories are static; buyers need verified, spec-compliant partners with SLA-backed responsiveness.

### Solution
Chat interface → parse → Explorium MCP → rank suppliers → return cards + CTA.

### Unique Value
- 72‑hour partner quote SLA
- ISO/AS9100 verification
- Sustainability transparency
- Activity/capacity signals

### MVP Scope
- Next.js single-page chat UI
- Server-only Explorium integration
- Deterministic parsing with LLM fallback (guarded)
- Supplier scoring + temperature
- Email capture + Calendly

### Out of Scope
Auth, real-time quoting, payments, supplier portal.

### Success Metrics
- ≥ 80% queries → ≥ 1 match
- p95 < 5s backend latency
- ≥ 30% CTA CTR

---

## docs/app_flow_document.md

> Tightened for implementability.

1) **Landing** → value prop + example prompts.
2) **Input** → chat send.
3) **Parse** → `parsing_agent` → `missing` fields?
   - If missing `location` → ask for state/ZIP.
4) **Match** → `explorium_adapter_agent` with filters:
   - country=US, NAICS ∈ {331110,331222,332721}, employee_count≥10, cnc_capability=true, has_website=true.
5) **Rank** → `match_scoring_agent` → 0..100 + temp.
6) **Respond** → `response_formatter_agent` → supplier cards.
7) **CTA** → email capture, Calendly, share search.

**Errors**
- No suppliers → suggest relaxing tolerance/lead time.
- API fail → friendly retry text.

---

## docs/backend_structure_document.md

> Your structure preserved. Added stricter contracts and error model.

### Architecture
- Next.js App Router (Vercel). Stateless.
- Single route: `POST /api/match-suppliers`.
- Secrets in `.env.local` only.

### Request
```json
{
  "query": "I need 500 lbs of 304 stainless…",
  "context": { "location": "TX" }
}
```

### Success Response
```json
{
  "message": "✅ Found 3 qualified U.S. manufacturers…",
  "suppliers": [
    {
      "company_name": "Midwest Precision Metals",
      "hq_location": "Cleveland, OH",
      "matchScore": 92,
      "matchTemp": "hot",
      "certifications": ["ISO 9001","AS9100"],
      "lead_time_days": 10,
      "sustainability": { "recycled_content_percent": 72 }
    }
  ],
  "cta": "Would you like us to connect you…?"
}
```

### Clarification Response
```json
{ "needsClarification": true, "message": "Provide state or ZIP to match nearby U.S. manufacturers." }
```

### Data Flow
1) Parse →
2) Clarify or build MCP payload →
3) Call Explorium →
4) Score →
5) Format →
6) Return JSON.

### Security
- API key in env; never to client.
- Timeouts (≤ 8s), maxDuration 30s.
- Structured error mapping.

### Logging (MVP)
- `console.log` with requestId. Optional webhook for RFQs.

### Dependencies
- `next@14+`. Optional OpenAI for guarded parsing fallback.

---

## docs/implementation_plan.md

**Milestone 0 — Repo + Guardrails (0.5d)**
- Init Next.js (App Router). Typescript, ESLint, Prettier.
- Add `/rules/*` to root. Add CI checks (type, lint, build).

**Milestone 1 — Parsing (1d)**
- Implement `lib/parser.ts` (regex + normalizers).
- Include schema + unit tests for edge cases (tolerance parsing, 304/316, ± formats, mm/in conversions).

**Milestone 2 — Explorium Adapter (1d)**
- `lib/explorium.ts` with strict types, retry, timeout, circuit breaker.
- Payload builder enforcing US, NAICS, required signals.

**Milestone 3 — Scoring (0.5d)**
- Pure function `rankSuppliers(parsed, suppliers)`; deterministic tests.

**Milestone 4 — API Route (0.5d)**
- `app/api/match-suppliers/route.ts` wiring parse → adapter → score → format.

**Milestone 5 — UI (1d)**
- Minimal chat UI + supplier cards + CTA (email, Calendly, share link).
- p95 < 5s budget; stream typing indicator.

**Milestone 6 — QA + Hardening (0.5d)**
- Error catalog tests, load test to 20 RPS, log redaction.

**Deliverables**
- Working MVP on Vercel; env doc; test coverage ≥ 70% for lib.

---

## docs/tech_stack_document.md

**Frontend**
- Next.js 14 (App Router), React 18, TypeScript, Tailwind (or CSS Modules), React Hook Form.

**Backend**
- Next.js Route Handlers, `fetch` with AbortController, no DB.

**Integrations**
- Explorium MCP API (Bearer auth).
- Calendly embed.

**Tooling**
- ESLint, Prettier, Vitest/Jest + Testing Library, msw for API mocks.

**Operational**
- Vercel deploy, Env via `.env.local` + Vercel Project Vars.

**Env Vars**
- `EXPLORIUM_API_KEY`
- `CALENDLY_URL`
- `APP_ORIGIN`

---

## rules/00_project_tenets.md

- Server-only data access; never leak keys.
- Deterministic first; LLM only as guarded fallback.
- Schemas at every boundary; fail closed.
- P95 latency < 5s; payloads < 64KB.

---

## rules/01_security_and_secrets.md

- Keys only in env; never in repo.
- Redact `Authorization` and hostnames in logs.
- Timebox external calls; abort on deadline.
- Minimal scopes; principle of least privilege.

---

## rules/02_code_style_ts_react.md

- Strict TS. `noImplicitAny`, `exactOptionalPropertyTypes`.
- Pure functions in `lib/`. UI components dumb/presentational.
- No dynamic `any`. Parse/score are side‑effect free.

---

## rules/03_api_contracts.md

**Route** `POST /api/match-suppliers`

**Headers**: `Content-Type: application/json`

**Body**: `{ query: string, context?: { location?: string } }`

**200**: success payload (see backend doc)

**400**: invalid input → `{ code: 'BAD_REQUEST', message }`

**422**: needs clarification → `{ code: 'CLARIFY', fields: [...] }`

**502/504**: upstream/downstream timeout → `{ code: 'UPSTREAM_TIMEOUT' }`

**Trace**: `x-request-id` in every response.

---

## rules/04_data_governance.md

- Do not store PII in MVP.
- RFQ text logged only for ops triage; purge after 30 days (manual).

---

## rules/05_performance_slo.md

- P95 < 5s overall; Explorium budget ≤ 3s.
- Cold start under 500ms on Vercel (keep deps lean).

---

## rules/06_commit_conventions.md

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- One logical change per PR. CI must pass.

---

## rules/07_testing_policy.md

- Unit: parser, scoring (table-driven tests).
- Contract: msw mocks for Explorium edge cases.
- E2E (light): happy path + "no suppliers" path.

---

# Appendix — Code Stubs (for Cursor “Create File”)

**app/api/match-suppliers/route.ts** (signature)
```ts
import { NextRequest, NextResponse } from 'next/server';
import { parseRequirements } from '@/lib/parser';
import { queryExplorium } from '@/lib/explorium';
import { rankSuppliers } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  const { query, context } = await req.json();
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ code: 'BAD_REQUEST', message: 'query required' }, { status: 400 });
  }

  const parsed = parseRequirements(query, context);
  if (parsed.missing.includes('location')) {
    return NextResponse.json({ code: 'CLARIFY', fields: ['location'], needsClarification: true, message: 'Provide state or ZIP.' }, { status: 422 });
  }

  const upstream = await queryExplorium(parsed, query);
  if (!upstream.ok) {
    return NextResponse.json({ code: upstream.code || 'UPSTREAM_ERROR', message: upstream.message }, { status: upstream.status || 502 });
  }

  const ranked = rankSuppliers(parsed, upstream.data);
  return NextResponse.json({ message: `✅ Found ${ranked.length} qualified U.S. manufacturers.`, suppliers: ranked, cta: 'Would you like us to connect you…?' });
}
```

**lib/parser.ts** (signature)
```ts
export function parseRequirements(input: string, ctx?: { location?: string }) { /* impl */ }
```

**lib/explorium.ts** (signature)
```ts
export async function queryExplorium(parsed: any, originalQuery: string): Promise<{ ok: true; data: any[] } | { ok: false; code: string; message: string; status?: number }>{ /* impl */ }
```

**lib/scoring.ts** (signature)
```ts
export function rankSuppliers(parsed: any, suppliers: any[]): any[] { /* impl */ }
```

