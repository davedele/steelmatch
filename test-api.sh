#!/bin/bash

# SteelMatch Pro - API Integration Test Script
# Tests the Explorium API integration end-to-end

echo "======================================"
echo "SteelMatch Pro - API Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5173/api/match-suppliers"

echo "Testing API endpoint: $API_URL"
echo ""

# Test 1: Basic request with location
echo "----------------------------------------"
echo "Test 1: Basic RFQ with Texas location"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need 500 lbs of 304 stainless steel, CNC machined, delivered in 2 weeks",
    "context": {
      "location": "TX",
      "deliveryDays": 14
    }
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status Code: $HTTP_STATUS"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Test 1 PASSED${NC}"
  SUPPLIERS_COUNT=$(echo "$BODY" | jq '.suppliers | length' 2>/dev/null || echo "0")
  echo "  Found $SUPPLIERS_COUNT suppliers"
elif [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${RED}✗ Test 1 FAILED - Invalid API Key${NC}"
  echo -e "${YELLOW}  ACTION: Update EXPLORIUM_API_KEY in .env.local${NC}"
  echo -e "${YELLOW}  Get key at: https://admin.explorium.ai/api-key${NC}"
elif [ "$HTTP_STATUS" = "422" ]; then
  echo -e "${YELLOW}⚠ Test 1 - Clarification needed${NC}"
else
  echo -e "${RED}✗ Test 1 FAILED - Status $HTTP_STATUS${NC}"
fi
echo ""

# Test 2: Request without location (should trigger clarification)
echo "----------------------------------------"
echo "Test 2: Request without location"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need 300 lbs of aluminum 6061, CNC milled",
    "context": {}
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status Code: $HTTP_STATUS"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_STATUS" = "422" ]; then
  echo -e "${GREEN}✓ Test 2 PASSED - Correctly requesting clarification${NC}"
else
  echo -e "${YELLOW}⚠ Test 2 - Expected 422, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 3: Request with ZIP code
echo "----------------------------------------"
echo "Test 3: Request with ZIP code"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Titanium Grade 5, 5-axis milling, ISO 9001 required",
    "context": {
      "location": "90210",
      "deliveryDays": 21
    }
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status Code: $HTTP_STATUS"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Test 3 PASSED${NC}"
elif [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${RED}✗ Test 3 FAILED - Invalid API Key${NC}"
else
  echo -e "${YELLOW}⚠ Test 3 - Status $HTTP_STATUS${NC}"
fi
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"

if [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${RED}API Key Issue Detected${NC}"
  echo ""
  echo "The Explorium API key needs to be updated:"
  echo "1. Visit: https://admin.explorium.ai/api-key"
  echo "2. Generate a new API key"
  echo "3. Update .env.local with: EXPLORIUM_API_KEY=your_new_key"
  echo "4. Restart the dev server"
  echo ""
  echo "Current key may be invalid or revoked."
else
  echo "API endpoint is responding correctly"
  echo "Check individual test results above"
fi
echo ""

