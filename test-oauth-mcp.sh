#!/bin/bash

# Test MCP endpoints with OAuth API key
API_KEY="ghl_mcp_2f7f4e215616b236422d453a622c9c5dc6794ae9f1ecd2c7fa323f7bf66553e1"
BASE_URL="https://dealflow-mcp-rl-platform.vercel.app"

echo "Testing MCP endpoints with OAuth API key..."
echo "=========================================="
echo ""

# Test get_location endpoint
echo "1. Testing get_location endpoint:"
curl -s \
  -H "X-Tenant-API-Key: $API_KEY" \
  "$BASE_URL/api/mcp/get_location" | jq '.success, .data.name // .error'

# Test search_contacts endpoint  
echo -e "\n2. Testing search_contacts endpoint:"
curl -s \
  -H "X-Tenant-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 2}' \
  "$BASE_URL/api/mcp/search_contacts" | jq '.success, .data.contacts[0].name // .data.meta.total // .error'

# Test get_pipelines endpoint
echo -e "\n3. Testing get_pipelines endpoint:"
curl -s \
  -H "X-Tenant-API-Key: $API_KEY" \
  "$BASE_URL/api/mcp/get_pipelines" | jq '.success, .data.pipelines[0].name // .error'

# Test get_calendars endpoint
echo -e "\n4. Testing get_calendars endpoint:"
curl -s \
  -H "X-Tenant-API-Key: $API_KEY" \
  "$BASE_URL/api/mcp/get_calendars" | jq '.success, .data.calendars[0].name // .error'

# Test search_conversations endpoint
echo -e "\n5. Testing search_conversations endpoint:"
curl -s \
  -H "X-Tenant-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit": 2}' \
  "$BASE_URL/api/mcp/search_conversations" | jq '.success, .data.conversations[0].id // .error'

echo -e "\nTest complete!"