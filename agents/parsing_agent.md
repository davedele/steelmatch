## Parsing Agent

Role: Deterministic extractor for material, tolerance, quantity/weight, delivery window, location.

Method
- Tiered parse: (1) fast regex, (2) rule-based normalization, (3) LLM fallback (guard-railed, temperature=0, schema constrained).
- Unit harmonization: inch/mm, lbs/kg → canonical SI/imperial duals.

Schema
```ts
export interface ParsedRequirements {
  material: { family: 'steel'|'aluminum'|'titanium'|'other'; grade?: string } | null;
  tolerance: { value: number; unit: 'in'|'mm' } | null;
  quantity: { value: number; unit: 'lbs'|'kg'|'units' } | null;
  delivery: { days?: number; weeks?: number } | null;
  location?: { state?: string; zip?: string } | null;
  capabilities?: string[];
  certifications?: string[];
  missing: Array<'location'|'material'|'delivery'|'quantity'|'tolerance'>;
}
```

Clarification Heuristics
- If `location` missing → ask state/ZIP.
- If `delivery` ambiguous and lead-time critical → ask for latest acceptable ship date.


