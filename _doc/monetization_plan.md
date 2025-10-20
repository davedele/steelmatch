# SteelMatch Pro — Monetization Plan

## Goals
- Revenue within 30–45 days post-MVP.
- Unit economics ≥ 3.0 LTV/CAC by Month 6.
- Avoid paywalls that block early traction; monetize at conversion points.

---

## Monetization Lanes (stackable)

### 1) Success Fee (MVP Day 1)
- **Trigger**: Qualified introduction that becomes a paid PO within 90 days.
- **Model**: 3–6% of PO value, capped at $15k per deal; floor $750.
- **Eligibility**: Only on suppliers who accept the 72‑hour quote SLA and sign rev‑share addendum.
- **Verification**: Supplier self‑report + random audit (invoice hash), optional escrow intro via Stripe Connect.
- **Why**: Zero friction for buyers; suppliers pay when revenue realized.

### 2) Supplier Subscription (V1.1)
- **Tiers**:
  - **Basic ($299/mo)**: Listed + inbound match notifications (warm/cold), manual intros.
  - **Pro ($799/mo)**: Priority in rank (non‑distorting: tie‑break only), hot‑lead alerts, team seats (3), analytics.
  - **Enterprise ($2,000/mo)**: Dedicated success mgr, SLA‑backed intros, API for CRM push.
- **Rules**: No pay‑to‑win; paid tiers can’t override quality or certification scoring. Only tie‑breakers and response‑time perks.

### 3) Buyer Pro Tools (V1.2)
- **$99/mo** per buyer org: saved RFQs, supplier compare, export, shared workspaces.
- **$299/mo**: compliance bundle (cert auto‑fetch, COI reminders), unlimited compares.

### 4) Data/API (V2)
- **Read API**: programmatic supplier search (rate‑limited) — $0.05 per enriched record, $0.50 per resolved match card.
- **Reports**: quarterly capacity maps, pricing/lead‑time benchmarks — $4k/report.

### 5) Sponsored Content (strict, V1.3)
- **Constraint**: Label as “Sponsored”. No influence on core rank. Shown after top matches or in sidebar. Flat CPM/CPL.

---

## Pricing Guardrails
- Do not degrade match quality for payment.
- Keep default experience free for buyers.
- Ensure suppliers can opt out of rev‑share by choosing subscription tiers (but lose success‑fee-only access).

---

## Funnel + Conversion Points
1. **Anonymous search → results** (free)
2. **Connect/Intro** (email required)
3. **Intro success** (supplier pays success fee if deal closes)
4. **Repeat usage** (upsell buyer tools)
5. **Supplier inbound volume** (upsell Pro/Enterprise)

---

## Unit Economics (initial assumptions)
- Avg PO (prototype/short‑run): **$12k**; take rate 4% → **$480** revenue/deal.
- Hot lead→win rate: **15%**; 3 hot leads/introduction per buyer.
- Cost per qualified intro: **$70** (data + ops).
- CAC (supplier, paid tier): **$600** via outbound/email + demos.
- LTV (supplier Pro @ $799/mo, 10‑mo life): **$7,990**. LTV/CAC ≈ **13.3**.
- Blended margin target ≥ **75%** after data costs.

---

## Anti‑gaming and Integrity
- **Rank firewall**: paid status only resolves ties; cannot push unqualified shops above qualified ones.
- **72‑hour SLA tracking**: demote suppliers that miss SLA repeatedly; potential refund/credit.
- **Deal verification**: invoice hash + PO amount attestations; random audit 10%.
- **Conflict policy**: disclose if a supplier is an investor or affiliate; remove from tie‑break privilege.

---

## Billing Mechanics
- **Processor**: Stripe.
- **Models**: Stripe Invoices for success fees; Stripe Subscriptions for tiers; Stripe Connect (Standard) if we pilot escrowed intro.
- **Events**: `lead.accepted`, `intro.scheduled`, `intro.completed`, `deal.reported`, `success_fee.invoiced`, `success_fee.paid`.
- **Dunning**: 7/14/21‑day email with auto‑downgrade.

---

## Ops Playbook
- **Lead Ops**: human QA on early “hot” matches to protect trust.
- **Supplier Onboarding**: verify certs (ISO/AS), site, NAICS fit, min employee count.
- **Dispute Process**: 30‑day window; provide redacted PO/invoice proof. Credit or waive if mismatch is on our parse.

---

## KPIs
- **GMV influenced** (30/60/90d)
- **Take‑rate revenue** (monthly)
- **Intro→PO conversion**
- **Supplier SLA adherence**
- **Buyer→repeat rate**
- **Time‑to‑first‑match (p95)**
- **Complaint rate** (per 100 intros)

---

## Rollout
- **MVP (Month 0)**: Success fee only; manual verification; invoice at close.
- **V1 (Month 1–2)**: Supplier Basic/Pro tiers; analytics; SLA dashboard.
- **V1.2 (Month 3)**: Buyer Pro Tools; compare/export; compliance add‑ons.
- **V1.3 (Month 4–5)**: Sponsored (labeled), limited inventory; strict firewalls.
- **V2 (Month 6+)**: Read API + benchmark reports.

---

## Legal/Compliance
- Clear **Terms** for success fee trigger (definition of “Qualified Introduction”, cooling‑off period 90 days).
- **Anti‑kickback** check for regulated buyers; no exclusivity.
- Data usage aligned with provider ToS (Explorium); no data resell without rights.

---

## In‑Product Hooks
- “This intro led to a PO?” lightweight 1‑click confirm + NPS.
- Supplier dashboard: SLA score, pipeline, subscription upgrade CTA.
- Buyer sticky banner after 2+ searches: “Save & compare (Pro Trial 14d).”

---

## Risk Mitigation
- If suppliers resist rev‑share → favor subscriptions; keep success‑fee for SMBs.
- If data costs inflate → cap free queries per IP/day; cache enrichments for 24h.
- If low matches in niche grades → expand NAICS set and add manual concierge pipeline.
