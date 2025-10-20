# Explorium API Authentication Issue

## Date: October 20, 2025

## Problem Summary

Unable to authenticate with Explorium REST API using the provided API key.

---

## Details

### API Key Information
- **Key**: `97769d7f-b4d2-4f8f-887c-b5c626228774`
- **Source**: https://admin.explorium.ai/api-key
- **Type**: MCP Docker Self-Hosting key

### Attempted Endpoints
```bash
POST https://api.explorium.ai/v1/businesses/stats
POST https://api.explorium.ai/v1/businesses/match
POST https://api.explorium.ai/v1/businesses
```

### Authentication Methods Tried
1. `Authorization: Bearer <key>` → **401 "invalid token"**
2. `X-API-Key: <key>` → **401 "Identity could not be authenticated"**  
3. `apikey: <key>` → **401 "Identity could not be authenticated"**

### Error Response
```json
{
  "code": "al10",
  "message": "invalid token"
}
```

---

## Root Cause

After reviewing the [Explorium MCP GitHub repository](https://github.com/explorium-ai/mcp-explorium), we discovered:

> **API Key Requirements**
> - ✅ Claude Desktop Extension - No API key required
> - ✅ MCP Remote Connections (Streamable HTTP/SSE/STDIO) - No API key required
> - 🔑 Docker Self-Hosting - Requires API key

**The API key is for Docker self-hosting the MCP server, NOT for REST API calls!**

---

## Questions for Explorium Support

1. **REST API Access**: Is there a separate API key needed for direct REST API calls to `https://api.explorium.ai/v1/*` endpoints?

2. **API Key Types**: Are there different types of API keys?
   - MCP Docker hosting key
   - REST API key
   - Different access levels?

3. **Documentation Clarification**: The docs at https://developers.explorium.ai/reference/businesses mention:
   - `POST /businesses/stats`
   - `POST /businesses/match`
   - `POST /businesses`
   
   How do we authenticate with these endpoints?

4. **Alternative Approach**: Should we:
   - Use the MCP protocol instead? (`https://mcp.explorium.ai/mcp`)
   - Self-host the MCP server with Docker?
   - Request a different type of API key?

---

## Current Implementation

We implemented the 3-step workflow documented at:
https://developers.explorium.ai/reference/quick-starts/quick-starts

```typescript
// Our implementation follows this workflow:
1. POST /businesses/stats - Assess market potential
2. POST /businesses/match - Get business_ids
3. POST /businesses - Fetch enriched data

// With proper filters structure:
{
  countries: {
    values: ["United States"],
    operator: "include"
  }
}
```

But we cannot authenticate with any method we've tried.

---

## Workaround

We've implemented a mock mode for development:
```bash
# .env.local
EXPLORIUM_MOCK_MODE=true
```

This allows frontend development and testing while we resolve the authentication issue.

---

## Contact Information

- **Email**: support@explorium.ai
- **Documentation**: https://developers.explorium.ai
- **API Key Portal**: https://admin.explorium.ai/api-key
- **MCP Repository**: https://github.com/explorium-ai/mcp-explorium

---

## Next Steps

1. Contact Explorium support at support@explorium.ai
2. Request clarification on REST API authentication
3. Ask if we need a different type of API key
4. Consider using MCP protocol instead of REST API
5. Evaluate Docker self-hosting option

---

## References

- [Explorium Quick Starts](https://developers.explorium.ai/reference/quick-starts/quick-starts)
- [Explorium Businesses API](https://developers.explorium.ai/reference/businesses)
- [Explorium MCP GitHub](https://github.com/explorium-ai/mcp-explorium)
- [Getting API Key](https://admin.explorium.ai/api-key)

