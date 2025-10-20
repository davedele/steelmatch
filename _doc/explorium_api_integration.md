# Explorium API Integration - Implementation Notes

## Overview
This document describes the Explorium API integration implementation for SteelMatch Pro, following the official [Explorium API documentation](https://developers.explorium.ai/reference/quick-starts/quick-starts).

## Implementation Date
October 20, 2025

## API Workflow

Following the recommended workflow from Explorium's documentation:

### 1. **Assess Market Potential** (`/businesses/stats`)
- Gauge the size and scope of target audience
- Helps avoid unnecessary API calls
- Non-critical step - continues if it fails

### 2. **Match Businesses** (`/businesses/match`)
- Find accurate `business_id` for target companies
- Uses natural language query + filters
- Returns matches with confidence scores
- Extract top 5 business_ids

### 3. **Fetch Business Data** (`/businesses`)
- Retrieve enriched company records
- Uses matched `business_id` values
- Returns comprehensive business data with signals

## Key Changes Made

### 1. **Correct API Endpoints**
- **Base URL**: `https://api.explorium.ai/v1`
- **Endpoints**:
  - `POST /businesses/stats` - Market assessment
  - `POST /businesses/match` - Business matching
  - `POST /businesses` - Data fetching

### 2. **Filter Structure**
Implemented proper filter structure using `values` objects:
```typescript
{
  countries: {
    values: ['United States'],
    operator: 'include'
  },
  naics_codes: {
    values: ['331110', '331222', ...],
    operator: 'include'
  }
}
```

### 3. **Rate Limiting**
- Implemented rate limiter class
- **Limit**: 200 queries per minute (1 request every 300ms)
- Automatic queue management
- Prevents API throttling

### 4. **Error Handling**
- Captures `correlation_id` from responses
- Logs full error details for debugging
- Graceful degradation (stats failure doesn't stop workflow)
- Proper HTTP status code handling

### 5. **Pagination Support**
- `page` and `page_size` parameters
- Max 100 records per page
- Currently fetching top 5 matches

### 6. **Signal Requests**
Requesting comprehensive signals:
- `company_name`, `hq_location`, `website`
- `iso_9001_certified`, `as9100_certified`, `nadcap_certified`
- `lead_time_days`, `avg_lead_time_days`
- `recycled_content_percent`, `sustainability_score`
- `has_cnc_capability`, `manufacturing_capabilities`

## Security

### API Key Management
- ✅ API key stored in `.env.local`
- ✅ `.env.local` is in `.gitignore`
- ⚠️ **ACTION REQUIRED**: Rotate API key `97769d7f-b4d2-4f8f-887c-b5c626228774` as it was committed to the repository

### Key Rotation Steps
1. Go to [Explorium Admin](https://admin.explorium.ai/api-key)
2. Generate new API key
3. Update `.env.local` with new key
4. Test API calls
5. Delete old key from Explorium dashboard

## Rate Limits

According to Explorium documentation:
- **Rate**: 200 queries per minute (qpm)
- **Implementation**: Client-side rate limiting with 300ms minimum interval
- **Handling**: Automatic queuing and throttling

## Response Format

All responses include:
- `correlation_id` - For debugging and support
- Standard HTTP status codes
- Detailed error messages

## Testing Checklist

- [ ] Test stats endpoint with various filters
- [ ] Test match endpoint with natural language queries
- [ ] Test fetch endpoint with business_ids
- [ ] Verify rate limiting doesn't cause errors
- [ ] Check correlation_id logging
- [ ] Test error scenarios (invalid key, network failure)
- [ ] Verify pagination works with >5 results

## Known Issues & TODOs

1. **Signal Name Verification** - Need to verify actual signal names against Explorium Data Catalog
2. **Pagination** - Currently only fetches first page (top 5 results)
3. **Stats Endpoint** - Not failing the request if stats call fails (by design)
4. **Match Confidence** - Not yet using confidence scores in ranking algorithm

## API Documentation References

- [Quick Starts](https://developers.explorium.ai/reference/quick-starts/quick-starts)
- [Businesses Overview](https://developers.explorium.ai/reference/businesses)
- [Authentication Guide](https://developers.explorium.ai/reference/quick-starts/quick-starts#before-you-begin)
- [Rate Limits](https://developers.explorium.ai/reference/quick-starts/quick-starts#best-practices-for-using-the-api)

## Support

For issues or questions:
- **Email**: support@explorium.ai
- **Slack**: Dedicated channel (if available)
- **Correlation IDs**: Include in all support requests for faster resolution

## Next Steps

1. **Rotate API Key** (HIGH PRIORITY)
2. **Verify Signal Names** - Check Data Catalog for actual field names
3. **Test Real API Calls** - Run end-to-end tests with production API
4. **Monitor Usage** - Track API calls and credit consumption
5. **Optimize Filters** - Refine based on actual result quality
6. **Add Caching** - Consider caching stats results to reduce API calls

