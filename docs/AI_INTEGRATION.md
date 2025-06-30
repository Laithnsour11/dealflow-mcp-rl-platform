# AI Platform Integration Guide (SSE & Streaming HTTP)

This guide explains how to use the GoHighLevel MCP Platform with AI services like VAPI, ElevenLabs, and other AI agents that require SSE or streaming HTTP.

## Table of Contents
1. [Overview](#overview)
2. [Available Endpoints](#available-endpoints)
3. [SSE Integration](#sse-integration)
4. [Streaming HTTP Integration](#streaming-http-integration)
5. [VAPI Integration](#vapi-integration)
6. [ElevenLabs Integration](#elevenlabs-integration)
7. [Generic AI Agent Integration](#generic-ai-agent-integration)
8. [Response Formats](#response-formats)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

## Overview

The platform provides three streaming endpoint types for AI integration:

1. **SSE Endpoint** (`/api/sse/[tool]`) - Server-Sent Events for real-time streaming
2. **Stream Endpoint** (`/api/stream/[tool]`) - Chunked HTTP streaming  
3. **AI Endpoint** (`/api/ai/[tool]`) - Auto-detects format based on client

## Available Endpoints

### Base URLs

```
SSE:      https://dealflow-mcp-rl-platform.vercel.app/api/sse/[tool_name]
Stream:   https://dealflow-mcp-rl-platform.vercel.app/api/stream/[tool_name]
AI:       https://dealflow-mcp-rl-platform.vercel.app/api/ai/[tool_name]
```

### Common AI Tools

- `search_contacts` - Find contacts by various criteria
- `get_contact_by_phone` - Look up contact by phone number
- `create_contact` - Create new contact
- `send_sms` - Send SMS message
- `send_email` - Send email
- `create_appointment` - Schedule appointment
- `get_free_slots` - Get available calendar slots
- `create_opportunity` - Create sales opportunity
- `update_opportunity_status` - Update deal status

## SSE Integration

### Format

Server-Sent Events stream with the following event types:

```
event: connected
data: {"status": "connected", "message": "SSE stream established"}

event: processing
data: {"status": "processing", "tool": "search_contacts"}

event: result
data: {"success": true, "data": {...}, "metadata": {...}}

event: complete
data: {"status": "complete", "message": "Request completed successfully"}
```

### JavaScript Example

```javascript
const apiKey = 'ghl_mcp_xxxxxxxxxxxxx';
const eventSource = new EventSource(
  `https://dealflow-mcp-rl-platform.vercel.app/api/sse/search_contacts?query=john`,
  {
    headers: {
      'X-Tenant-API-Key': apiKey
    }
  }
);

eventSource.addEventListener('connected', (e) => {
  console.log('Connected:', JSON.parse(e.data));
});

eventSource.addEventListener('result', (e) => {
  const result = JSON.parse(e.data);
  console.log('Result:', result.data);
});

eventSource.addEventListener('error', (e) => {
  const error = JSON.parse(e.data);
  console.error('Error:', error);
  eventSource.close();
});

eventSource.addEventListener('complete', (e) => {
  console.log('Complete:', JSON.parse(e.data));
  eventSource.close();
});
```

### cURL Example

```bash
curl -N -H "X-Tenant-API-Key: ghl_mcp_xxxxxxxxxxxxx" \
  "https://dealflow-mcp-rl-platform.vercel.app/api/sse/get_contact_by_phone?phone=+1234567890"
```

## Streaming HTTP Integration

### Format

Newline-delimited JSON (NDJSON) format:

```json
{"type":"start","status":"connected","message":"Stream initialized"}
{"type":"status","status":"authenticating","tool":"search_contacts"}
{"type":"result","success":true,"data":{...},"metadata":{...}}
{"type":"complete","status":"success","message":"Request completed"}
```

### Python Example

```python
import requests
import json

api_key = 'ghl_mcp_xxxxxxxxxxxxx'
url = 'https://dealflow-mcp-rl-platform.vercel.app/api/stream/send_sms'

headers = {
    'X-Tenant-API-Key': api_key,
    'Content-Type': 'application/json'
}

data = {
    'contactId': 'contact_123',
    'message': 'Hello from AI agent!'
}

response = requests.post(url, json=data, headers=headers, stream=True)

for line in response.iter_lines():
    if line:
        chunk = json.loads(line)
        print(f"{chunk['type']}: {chunk}")
        
        if chunk['type'] == 'result':
            print(f"SMS sent successfully: {chunk['data']}")
        elif chunk['type'] == 'error':
            print(f"Error: {chunk['error']}")
```

## VAPI Integration

VAPI expects SSE format. Use the `/api/ai/` endpoint which auto-detects VAPI:

### VAPI Function Configuration

```json
{
  "name": "search_contacts",
  "url": "https://dealflow-mcp-rl-platform.vercel.app/api/ai/search_contacts",
  "method": "POST",
  "headers": {
    "X-Tenant-API-Key": "ghl_mcp_xxxxxxxxxxxxx"
  },
  "streaming": true,
  "streamFormat": "sse",
  "parameters": {
    "query": {
      "type": "string",
      "description": "Search query for contacts"
    }
  }
}
```

### VAPI Action Example

```javascript
// In your VAPI assistant configuration
{
  "actions": [
    {
      "name": "lookupContact",
      "description": "Look up a contact by phone number",
      "url": "https://dealflow-mcp-rl-platform.vercel.app/api/ai/get_contact_by_phone",
      "method": "POST",
      "headers": {
        "X-Tenant-API-Key": "{{env.GHL_API_KEY}}"
      },
      "body": {
        "phone": "{{phone_number}}"
      },
      "streaming": true
    }
  ]
}
```

## ElevenLabs Integration

ElevenLabs typically uses streaming HTTP. Use the `/api/stream/` or `/api/ai/` endpoints:

### ElevenLabs Webhook Configuration

```json
{
  "webhook_url": "https://dealflow-mcp-rl-platform.vercel.app/api/stream/create_contact",
  "method": "POST",
  "headers": {
    "X-Tenant-API-Key": "ghl_mcp_xxxxxxxxxxxxx",
    "Content-Type": "application/json"
  },
  "streaming": true,
  "timeout": 30000
}
```

### Integration Example

```python
# ElevenLabs AI Agent Integration
import requests
import json

class GHLConnector:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://dealflow-mcp-rl-platform.vercel.app/api/stream"
    
    def process_command(self, command, params):
        url = f"{self.base_url}/{command}"
        headers = {
            'X-Tenant-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, json=params, headers=headers, stream=True)
        
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                if data['type'] == 'result':
                    return data['data']
                elif data['type'] == 'error':
                    raise Exception(data['error'])
        
        return None

# Usage in ElevenLabs agent
connector = GHLConnector('ghl_mcp_xxxxxxxxxxxxx')

# Look up contact
contact = connector.process_command('get_contact_by_phone', {
    'phone': '+1234567890'
})

# Send SMS
sms_result = connector.process_command('send_sms', {
    'contactId': contact['id'],
    'message': 'Hi! This is your AI assistant.'
})
```

## Generic AI Agent Integration

### Auto-Detection Endpoint

The `/api/ai/` endpoint automatically detects the client type:

```bash
# For SSE (VAPI-style)
curl -H "Accept: text/event-stream" \
     -H "X-Tenant-API-Key: ghl_mcp_xxxxxxxxxxxxx" \
     "https://dealflow-mcp-rl-platform.vercel.app/api/ai/search_contacts?query=john"

# For Streaming HTTP (ElevenLabs-style)
curl -H "Accept: application/x-ndjson" \
     -H "X-Tenant-API-Key: ghl_mcp_xxxxxxxxxxxxx" \
     "https://dealflow-mcp-rl-platform.vercel.app/api/ai/search_contacts?query=john"
```

### Node.js Integration

```javascript
const https = require('https');

class GHLStreamClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async streamRequest(tool, params, onData, onError) {
    const url = new URL(`https://dealflow-mcp-rl-platform.vercel.app/api/sse/${tool}`);
    
    // Add params to URL for GET
    if (params) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
    }

    const options = {
      headers: {
        'X-Tenant-API-Key': this.apiKey,
        'Accept': 'text/event-stream'
      }
    };

    https.get(url, options, (response) => {
      let buffer = '';
      
      response.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onData(data);
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        });
      });
      
      response.on('error', onError);
    });
  }
}

// Usage
const client = new GHLStreamClient('ghl_mcp_xxxxxxxxxxxxx');

client.streamRequest('search_contacts', { query: 'john' }, 
  (data) => {
    if (data.type === 'result') {
      console.log('Found contacts:', data.data);
    }
  },
  (error) => {
    console.error('Stream error:', error);
  }
);
```

## Response Formats

### SSE Events

1. **connected** - Initial connection established
2. **processing** - Request being processed
3. **authenticated** - Authentication successful
4. **executing** - Tool being executed
5. **result** - Final result data
6. **error** - Error occurred
7. **complete** - Stream complete

### Streaming JSON Types

1. **start** - Stream initialized
2. **status** - Status update
3. **authenticated** - Auth successful
4. **executing** - Executing tool
5. **result** - Result data
6. **result_chunk** - Partial result (for large datasets)
7. **error** - Error occurred
8. **complete** - Stream finished

## Error Handling

### SSE Error Event

```
event: error
data: {"error": "Invalid API key", "statusCode": 401}
```

### Streaming Error

```json
{"type": "error", "error": "Contact not found", "code": "NOT_FOUND"}
```

### Common Errors

- `401` - Invalid or missing API key
- `404` - Tool or resource not found
- `429` - Rate limit exceeded
- `500` - Internal server error

## Best Practices

### 1. Connection Management

```javascript
// Always close connections when done
eventSource.close();

// Handle connection errors
eventSource.onerror = (error) => {
  console.error('Connection error:', error);
  eventSource.close();
  // Implement retry logic
};
```

### 2. Timeout Handling

```python
# Set appropriate timeouts
response = requests.post(url, 
    json=data, 
    headers=headers, 
    stream=True,
    timeout=30  # 30 second timeout
)
```

### 3. Rate Limiting

- Default: 1000 requests per 15 minutes
- Implement exponential backoff on 429 errors
- Use streaming endpoints efficiently

### 4. Large Result Sets

For tools that may return large datasets:

```javascript
// Handle chunked results
eventSource.addEventListener('result_chunk', (e) => {
  const chunk = JSON.parse(e.data);
  processChunk(chunk.items);
});
```

### 5. Authentication

Always include the API key in headers:

```
X-Tenant-API-Key: ghl_mcp_xxxxxxxxxxxxx
```

Never expose API keys in client-side code.

## Testing

### Test SSE Connection

```bash
# Test SSE endpoint
curl -N -H "X-Tenant-API-Key: YOUR_KEY" \
  "https://dealflow-mcp-rl-platform.vercel.app/api/sse/get_location"
```

### Test Streaming HTTP

```bash
# Test streaming endpoint
curl -H "X-Tenant-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}' \
  "https://dealflow-mcp-rl-platform.vercel.app/api/stream/search_contacts"
```

## Support

- For issues: [GitHub Issues](https://github.com/Laithnsour11/dealflow-mcp-rl-platform/issues)
- API Status: Check `/api/health` endpoint
- Documentation: [Main API Reference](./API_REFERENCE.md)