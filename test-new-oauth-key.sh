#!/bin/bash

# Test the new OAuth API key
API_KEY="ghl_mcp_2f7f4e215616b236422d453a622c9c5dc6794ae9f1ecd2c7fa323f7bf66553e1"
BASE_URL="https://dealflow-mcp-rl-platform.vercel.app"

echo "Testing new OAuth API key..."
echo "============================"
echo ""

# First test authentication
echo "1. Testing authentication:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\": \"$API_KEY\"}" \
  "$BASE_URL/api/debug/auth" | jq '.'

# Check tenant data
echo -e "\n\n2. Checking tenant data:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\": \"$API_KEY\"}" \
  "$BASE_URL/api/debug/tenant" | jq '.'

# Test get_location endpoint
echo -e "\n\n3. Testing get_location endpoint:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-Tenant-API-Key: $API_KEY" \
  "$BASE_URL/api/mcp/get_location" | jq '.'

# Check the logs
echo -e "\n\n4. Testing search_contacts with detailed error:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-Tenant-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 1}' \
  "$BASE_URL/api/mcp/search_contacts"