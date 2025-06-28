#!/bin/bash

# Test MCP endpoint with working API key
API_KEY="ghl_mcp_2e4f1bceff18c22e1bbf0e7f14ed92e0bca6f688b3476e82f0f23b1b1ad10d22"
BASE_URL="https://dealflow-mcp-rl-platform.vercel.app"

echo "Testing MCP endpoints with authenticated API key..."
echo "================================================"

# Test get_location endpoint
echo -e "\n1. Testing get_location endpoint:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-Tenant-API-Key: $API_KEY" \
  "$BASE_URL/api/mcp/get_location"

# Test search_contacts endpoint  
echo -e "\n\n2. Testing search_contacts endpoint:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-Tenant-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 5}' \
  "$BASE_URL/api/mcp/search_contacts"

# Test get_pipelines endpoint
echo -e "\n\n3. Testing get_pipelines endpoint:"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "X-Tenant-API-Key: $API_KEY" \
  "$BASE_URL/api/mcp/get_pipelines"

echo -e "\n\nDone!"