#!/bin/bash

# Test with OAuth tenant API key
API_KEY="ghl_mcp_361c82b4e1b16bf6ff0b6f565d7295048c50a7cc6beadc26d4861214ba4223fe"
BASE_URL="https://dealflow-mcp-rl-platform.vercel.app"

echo "Testing MCP endpoints with OAuth tenant API key..."
echo "================================================"
echo "This tenant has a real GoHighLevel OAuth access token"
echo ""

# Test authentication first
echo "1. Testing authentication:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\": \"$API_KEY\"}" \
  "$BASE_URL/api/debug/auth" | jq '.'

# Test get_location endpoint
echo -e "\n\n2. Testing get_location endpoint:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-Tenant-API-Key: $API_KEY" \
  "$BASE_URL/api/mcp/get_location" | jq '.'

# Test search_contacts endpoint  
echo -e "\n\n3. Testing search_contacts endpoint:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-Tenant-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}' \
  "$BASE_URL/api/mcp/search_contacts" | jq '.'

echo -e "\n\nDone!"