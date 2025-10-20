
### **project_requirements_document.md**

# SteelMatch Pro – Project Requirements

## Vision
SteelMatch Pro is an AI-powered matching platform that connects buyers with qualified U.S. steel and metals manufacturers based on specific technical, logistical, and quality requirements. The platform leverages real-time B2B data to deliver fast, accurate, and actionable supplier matches.

## Core Problem
Buyers in industrial sectors (e.g., automotive, aerospace, medical devices) struggle to find U.S.-based metal fabricators that meet precise specifications for material grade, tolerance, lead time, certifications, and sustainability. Existing directories are static and lack verification.

## Solution
A chat-style interface where users describe their needs in natural language. The system:
- Parses requirements (material, tolerance, volume, delivery window, location)
- Queries Explorium.ai’s live B2B database for U.S. manufacturers
- Returns ranked, verified suppliers with match scores and key differentiators

## Unique Value Proposition
- **Guaranteed SLAs**: All listed partners commit to a 72-hour quote response
- **Quality Verified**: Suppliers must hold ISO 9001, AS9100, or equivalent certifications
- **Sustainability Transparency**: Recycled content % and carbon footprint data where available
- **AI-Native Matching**: Real-time signals (e.g., hiring activity, tech stack) indicate active capacity

## MVP Scope
- Single-page React app (Next.js) with chat UI
- Integration with Explorium MCP API via secure backend route
- Basic requirement parsing (regex + fallback logic)
- Supplier ranking (0–100 score) with temperature indicator (hot/warm/cold)
- Email capture + Calendly CTA for manual matching
- No user accounts or payment in MVP; monetization via success fee or future subscription


## Out of Scope (MVP)
- User authentication
- Real-time quoting
- Payment processing
- Supplier onboarding portal

## Success Metrics
- >80% of queries return at least one qualified supplier
- <5-second response time
- >30% CTA click-through rate on results

---

### **app_flow_document.md**

# SteelMatch Pro – Application Flow

## User Journey

### Step 1: Landing
- User arrives at homepage
- Sees clear value prop: “AI-matched U.S. steel partners — certified, fast, sustainable”
- Example prompt shown: “I need 500 lbs of 304 stainless steel, machined to ±0.005", delivered in 2 weeks.”

### Step 2: Input
- User types natural language request
- Submits via “Send” button

### Step 3: Requirement Parsing
- System parses query for:
  - Material type (e.g., 304 stainless steel)
  - Tolerance (e.g., ±0.005")
  - Weight/volume
  - Delivery window (e.g., 2 weeks)
  - Location (state or ZIP)
- If location is missing, AI responds with clarifying question

### Step 4: Data Enrichment & Matching
- Backend calls Explorium MCP API with:
  - Filters: NAICS 331xxx, U.S. only, employee count >10
  - Required signals: website, CNC capability
  - Optional signals: ISO 9001, AS9100, sustainability metrics
- Returns up to 5 enriched supplier records

### Step 5: Ranking & Response
- Each supplier scored (0–100) based on:
  - Certification match (+15–20 pts)
  - Lead time alignment (+15 pts)
  - Sustainability data (+10 pts)
  - Activity signals (+10 pts)
- Temperature assigned:
  - Hot: ≥85
  - Warm: 65–84
  - Cold: <65
- AI formats professional response with supplier cards

### Step 6: Call to Action
- After results, display CTA section:
  - Email input field
  - “Schedule Intro Call” (Calendly link with pre-filled email)
  - Option to “Share this search” for future referral tracking
- All RFQs logged for manual follow-up

## Error Handling
- If no suppliers found: “No U.S. manufacturers currently match your specs. Try adjusting tolerance or delivery window.”
- If API fails: “We’re experiencing a brief delay. Please try again.”

## Future Flows (Post-MVP)
- User signup → token-based usage
- Saved RFQs and supplier comparisons
- Direct quote requests via integrated form

---

### **backend_structure_document.md**

# SteelMatch Pro – Backend Structure

## Architecture
- Next.js App Router (serverless functions on Vercel)
- Single API endpoint: `POST /api/match-suppliers`
- No database in MVP; stateless
- Environment variables for secrets

## API Endpoint: `/api/match-suppliers`

### Request Body
```json
{
  "query": "I need 500 lbs of 304 stainless steel...",
  "context": {
    "location": "TX" // optional, from prior messages
  }
}
```

### Response Body (Success)
```json
{
  "message": "✅ Found 3 qualified U.S. manufacturers...",
  "suppliers": [
    {
      "company_name": "Midwest Precision Metals",
      "hq_location": "Cleveland, OH",
      "matchScore": 92,
      "matchTemp": "hot",
      "certifications": ["ISO 9001", "AS9100"],
      "lead_time_days": 10,
      "sustainability": {
        "recycled_content_percent": 72
      }
    }
  ],
  "cta": "Would you like us to connect you...?"
}
```

### Response Body (Clarification Needed)
```json
{
  "needsClarification": true,
  "message": "To match you with nearby U.S. manufacturers..."
}
```

## Data Flow

1. Receive user query
2. Parse requirements using `/lib/parser.ts`
3. If location missing → return clarification message
4. Else, construct Explorium MCP payload:
   - `natural_language_query`: original query
   - `filters.country`: "United States"
   - `filters.naics_codes`: ["331110", "331222", "332721"]
   - `required_signals`: ["has_website", "employee_count_10_plus"]
   - `optional_signals`: certification and sustainability signals
5. Call `https://api.explorium.ai/v1/mcp/query` with Bearer token
6. Transform results → calculate match score
7. Format human-readable response
8. Return JSON to frontend

## Security
- Explorium API key stored in `.env.local`
- Never exposed to client
- Vercel serverless function handles all external calls

## Error Handling
- Network errors → user-friendly message
- Invalid Explorium response → log to console, return fallback
- Timeout: Vercel maxDuration = 30s

## Logging (MVP)
- Use `console.log` for debugging
- Optional: forward RFQs to webhook.site for manual review

## Dependencies
- `next`: 14+
- No external backend libraries required
- OpenAI optional (for future LLM parsing)