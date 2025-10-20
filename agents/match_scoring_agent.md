## Match Scoring Agent

Role: Convert adapter output + parsed reqs into rankable scores 0–100 with temperature buckets.

Scoring v0
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

Temperature
- Hot ≥ 85, Warm 65–84, Cold < 65.


