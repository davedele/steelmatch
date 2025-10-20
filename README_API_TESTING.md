# 🚀 SteelMatch Pro - API Testing Guide

## Quick Start

### 1. Start the Development Server
```bash
npm run dev
```
Server runs on: http://localhost:5173

### 2. Run Automated Tests
```bash
./test-api.sh
```

Expected output: **3/3 tests passing ✅**

---

## Test Modes

### 🎭 Mock Mode (Current)
**Enable**: Set `EXPLORIUM_MOCK_MODE=true` in `.env.local`

**Use for**:
- Frontend development
- UI testing
- Demonstrations
- Integration testing

**Benefits**:
- No API key required
- Unlimited requests
- Instant responses
- Realistic data

### 🌐 Production Mode
**Enable**: Set `EXPLORIUM_MOCK_MODE=false` in `.env.local`

**Requires**:
- Valid Explorium API key
- Rate limit compliance (200 qpm)
- Network access

**Use for**:
- Production deployment
- Real data validation
- API integration testing

---

## Test Suite

### Test 1: Basic RFQ with State
```bash
curl -X POST http://localhost:5173/api/match-suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "query": "500 lbs of 304 stainless steel, CNC machined, 2 weeks to Texas",
    "context": {"location": "TX", "deliveryDays": 14}
  }' | jq
```

**Expected**: 200 OK with 5 suppliers, TX locations prioritized

### Test 2: Missing Location
```bash
curl -X POST http://localhost:5173/api/match-suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "query": "300 lbs of aluminum 6061, CNC milled",
    "context": {}
  }' | jq
```

**Expected**: 422 with clarification request for location

### Test 3: ZIP Code Request
```bash
curl -X POST http://localhost:5173/api/match-suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Titanium Grade 5, 5-axis milling, ISO 9001 required",
    "context": {"location": "90210", "deliveryDays": 21}
  }' | jq
```

**Expected**: 200 OK with 5 suppliers, delivery-filtered

---

## Response Formats

### ✅ Success (200 OK)
```json
{
  "message": "✅ Found 5 qualified U.S. manufacturers.",
  "suppliers": [
    {
      "company_name": "Precision Metals Inc",
      "hq_location": "Houston, TX",
      "matchScore": 75,
      "matchTemp": "warm",
      "lead_time_days": 10,
      "certifications": ["ISO 9001", "AS9100"],
      "recycled_content_percent": 75,
      "website": "https://example.com",
      "reasons": [
        "ISO 9001 certified",
        "Meets delivery target (10 days)",
        "75% recycled content"
      ]
    }
  ],
  "cta": "Would you like us to connect you?",
  "context": {
    "location": "TX",
    "deliveryDays": 14
  }
}
```

### ⚠️ Clarification (422)
```json
{
  "code": "CLARIFY",
  "fields": ["location"],
  "needsClarification": true,
  "message": "Provide state or ZIP."
}
```

### ❌ Error (4xx/5xx)
```json
{
  "code": "ERROR_CODE",
  "message": "Error description"
}
```

---

## Troubleshooting

### Tests Failing with 401 Error
**Cause**: Invalid API key or mock mode disabled

**Solution**:
```bash
# Enable mock mode in .env.local
EXPLORIUM_MOCK_MODE=true

# Restart server
npm run dev

# Rerun tests
./test-api.sh
```

### Server Not Starting
**Solution**:
```bash
# Kill any existing processes
pkill -f "next dev"

# Start fresh
npm run dev
```

### Tests Pass But Frontend Not Working
**Check**:
1. Server running on port 5173
2. Browser console for errors
3. Network tab for API calls
4. `.env.local` loaded correctly

---

## API Key Management

### Current Status
- Mock mode: ✅ Enabled
- Production API: ⚠️ Requires key rotation

### Rotate API Key (Required Before Production)

1. **Visit**: https://admin.explorium.ai/api-key
2. **Generate** new API key
3. **Update** `.env.local`:
   ```bash
   EXPLORIUM_API_KEY=your_new_key_here
   EXPLORIUM_MOCK_MODE=false
   ```
4. **Restart** server: `npm run dev`
5. **Test**: `./test-api.sh`
6. **Revoke** old key: `97769d7f-b4d2-4f8f-887c-b5c626228774`

---

## Files Changed

### Implementation
- `lib/explorium.ts` - Main API integration
- `lib/explorium-mock.ts` - Mock data provider
- `lib/parser.ts` - Request parsing
- `lib/scoring.ts` - Supplier ranking
- `app/api/match-suppliers/route.ts` - API endpoint

### Configuration
- `.env.local` - Environment variables
- `.env.example` - Documentation

### Testing
- `test-api.sh` - Automated test script
- `API_TEST_SUMMARY.md` - Test results
- `API_TEST_RESULTS.md` - Detailed analysis

### Documentation
- `EXPLORIUM_FIXES.md` - Issue fixes
- `_doc/explorium_api_integration.md` - Integration guide
- `README_API_TESTING.md` - This file

---

## Performance

### Mock Mode
- Response time: ~800ms
- Throughput: Unlimited
- Reliability: 100%

### Production Mode (Expected)
- Response time: 1-3s (3 API calls)
- Throughput: 200 qpm (rate limited)
- Reliability: 99.9%+

---

## What's Next

### ✅ Completed
- [x] Fix API endpoints
- [x] Implement 3-step workflow
- [x] Add rate limiting
- [x] Fix filter structure
- [x] Add correlation_id tracking
- [x] Create mock mode
- [x] Write test suite
- [x] Validate response formats

### 🔴 Before Production
- [ ] Rotate API key
- [ ] Test with real Explorium API
- [ ] Verify signal names from Data Catalog
- [ ] Load testing
- [ ] Error monitoring setup

### 🟡 Optional Enhancements
- [ ] Response caching
- [ ] Bulk processing
- [ ] Multi-page fetching
- [ ] Analytics tracking

---

## Support

### Internal
- Check `API_TEST_SUMMARY.md` for test status
- Review `EXPLORIUM_FIXES.md` for implementation details
- Read `_doc/explorium_api_integration.md` for API docs

### External
- **Explorium Support**: support@explorium.ai
- **Documentation**: https://developers.explorium.ai
- **API Key**: https://admin.explorium.ai/api-key

---

## Quick Reference

```bash
# Start server
npm run dev

# Run tests
./test-api.sh

# Enable mock mode
echo "EXPLORIUM_MOCK_MODE=true" >> .env.local

# Disable mock mode
echo "EXPLORIUM_MOCK_MODE=false" >> .env.local

# View logs
npm run dev | grep Explorium

# Test single endpoint
curl -X POST http://localhost:5173/api/match-suppliers \
  -H "Content-Type: application/json" \
  -d '{"query":"test","context":{"location":"TX"}}' | jq
```

---

**Status**: ✅ All tests passing  
**Mode**: 🎭 Mock mode enabled  
**Production Ready**: ⚠️ Pending API key rotation  

*Last Updated: October 20, 2025*

