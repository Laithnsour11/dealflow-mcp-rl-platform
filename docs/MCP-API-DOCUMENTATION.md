# MCP API Documentation

## Overview

The Multi-tenant GoHighLevel MCP (Model Context Protocol) Server provides secure, isolated access to 269+ GoHighLevel CRM operations through a unified API interface. Each tenant's data is completely isolated, ensuring enterprise-grade security for multi-account management.

## Base URL

```
Production: https://your-domain.vercel.app/api/mcp
Local: http://localhost:3000/api/mcp
```

## Authentication

All MCP endpoints require tenant authentication using an API key.

### Headers

```http
X-Tenant-API-Key: your-tenant-api-key
```

Or using Bearer token:

```http
Authorization: Bearer your-tenant-api-key
```

### Getting an API Key

Register your tenant account:

```bash
POST /api/tenant/register
Content-Type: application/json

{
  "name": "Your Company Name",
  "email": "admin@yourcompany.com",
  "subdomain": "yourcompany",
  "ghlApiKey": "your-gohighlevel-api-key",
  "ghlLocationId": "your-ghl-location-id",
  "plan": "pro"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "apiKey": "tenant_key_xxxxx",
    "plan": "pro",
    "usageLimit": 10000
  }
}
```

## Rate Limiting

- **Default**: 1000 requests per 15 minutes per tenant
- **Response Headers**:
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp for limit reset

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "code": "ERROR_CODE",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Access denied to resource |
| `NOT_FOUND` | 404 | Tool or resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INVALID_REQUEST` | 400 | Invalid parameters |
| `INTERNAL_ERROR` | 500 | Server error |

## MCP Tool Discovery

Discover all available tools:

```http
OPTIONS /api/mcp/discover
X-Tenant-API-Key: your-api-key
```

Response:
```json
{
  "success": true,
  "tools": [
    {
      "name": "search_contacts",
      "method": "getContacts",
      "description": "Search for contacts",
      "httpMethod": "GET",
      "parameters": {
        "query": { "type": "string", "required": false },
        "limit": { "type": "number", "required": false }
      }
    }
  ],
  "totalTools": 269,
  "categories": {
    "Contact Management": 45,
    "Conversation Management": 15,
    "Opportunity Management": 20
  }
}
```

## Contact Management Tools

### Search Contacts
```http
GET /api/mcp/search_contacts?query=john&limit=10
X-Tenant-API-Key: your-api-key
```

### Get Contact by ID
```http
GET /api/mcp/get_contact?contactId=contact_123
X-Tenant-API-Key: your-api-key
```

### Create Contact
```http
POST /api/mcp/create_contact
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "tags": ["lead", "hot"],
  "customFields": {
    "source": "website"
  }
}
```

### Update Contact
```http
POST /api/mcp/update_contact
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123",
  "firstName": "John",
  "lastName": "Smith",
  "tags": ["customer"]
}
```

### Delete Contact
```http
POST /api/mcp/delete_contact
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123"
}
```

### Add Contact Tags
```http
POST /api/mcp/add_contact_tags
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123",
  "tags": ["vip", "priority"]
}
```

### Remove Contact Tags
```http
POST /api/mcp/remove_contact_tags
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123",
  "tags": ["old-tag"]
}
```

## Conversation Management

### Get Conversations
```http
GET /api/mcp/get_conversations?limit=20&contactId=contact_123
X-Tenant-API-Key: your-api-key
```

### Get Conversation by ID
```http
GET /api/mcp/get_conversation?conversationId=conv_123
X-Tenant-API-Key: your-api-key
```

### Send Message
```http
POST /api/mcp/send_message
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "conversationId": "conv_123",
  "message": "Hello! Thanks for your interest."
}
```

## Opportunity Management

### Get Opportunities
```http
GET /api/mcp/get_opportunities?limit=50&stageId=stage_123
X-Tenant-API-Key: your-api-key
```

### Create Opportunity
```http
POST /api/mcp/create_opportunity
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123",
  "pipelineId": "pipeline_123",
  "stageId": "stage_123",
  "title": "New Deal - John Doe",
  "value": 5000,
  "status": "open"
}
```

### Move Opportunity Stage
```http
POST /api/mcp/move_opportunity_stage
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "opportunityId": "opp_123",
  "stageId": "stage_456"
}
```

### Get Pipelines
```http
GET /api/mcp/get_pipelines
X-Tenant-API-Key: your-api-key
```

### Get Pipeline Stages
```http
GET /api/mcp/get_stages?pipelineId=pipeline_123
X-Tenant-API-Key: your-api-key
```

## Calendar Management

### Get Calendars
```http
GET /api/mcp/get_calendars
X-Tenant-API-Key: your-api-key
```

### Get Appointments
```http
GET /api/mcp/get_appointments?startDate=2024-01-01&endDate=2024-01-31
X-Tenant-API-Key: your-api-key
```

### Create Appointment
```http
POST /api/mcp/create_appointment
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123",
  "calendarId": "cal_123",
  "title": "Initial Consultation",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "appointmentStatus": "confirmed"
}
```

## Task Management

### Get Tasks
```http
GET /api/mcp/get_tasks?assignedTo=user_123&status=open
X-Tenant-API-Key: your-api-key
```

### Create Task
```http
POST /api/mcp/create_task
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "title": "Follow up with lead",
  "description": "Call John about the proposal",
  "dueDate": "2024-01-20T17:00:00Z",
  "assignedTo": "user_123",
  "contactId": "contact_123"
}
```

### Complete Task
```http
POST /api/mcp/complete_task
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "taskId": "task_123"
}
```

## Notes Management

### Get Contact Notes
```http
GET /api/mcp/get_notes?contactId=contact_123
X-Tenant-API-Key: your-api-key
```

### Create Note
```http
POST /api/mcp/create_note
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123",
  "body": "Discussed pricing options. Very interested in premium package."
}
```

## Workflow Management

### Trigger Workflow
```http
POST /api/mcp/trigger_workflow
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "workflowId": "workflow_123",
  "contactId": "contact_123"
}
```

## Campaign Management

### Get Campaigns
```http
GET /api/mcp/get_campaigns
X-Tenant-API-Key: your-api-key
```

### Add Contact to Campaign
```http
POST /api/mcp/add_contact_to_campaign
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "campaignId": "campaign_123",
  "contactId": "contact_123"
}
```

## Custom Fields

### Get Custom Fields
```http
GET /api/mcp/get_custom_fields
X-Tenant-API-Key: your-api-key
```

### Get Contact Custom Values
```http
GET /api/mcp/get_custom_values?contactId=contact_123
X-Tenant-API-Key: your-api-key
```

### Update Custom Values
```http
POST /api/mcp/update_custom_values
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "contactId": "contact_123",
  "customFields": {
    "lead_score": 85,
    "industry": "Technology"
  }
}
```

## Analytics & Reporting

### Get Analytics
```http
GET /api/mcp/get_analytics?startDate=2024-01-01&endDate=2024-01-31&metrics=conversions,revenue
X-Tenant-API-Key: your-api-key
```

### Get Reporting Data
```http
GET /api/mcp/get_reporting_data?reportType=opportunity_conversion&period=last_30_days
X-Tenant-API-Key: your-api-key
```

## Webhook Management

### Get Webhooks
```http
GET /api/mcp/get_webhooks
X-Tenant-API-Key: your-api-key
```

### Create Webhook
```http
POST /api/mcp/create_webhook
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["contact.created", "opportunity.stage_changed"]
}
```

## User Management

### Get Users
```http
GET /api/mcp/get_users
X-Tenant-API-Key: your-api-key
```

### Get User by ID
```http
GET /api/mcp/get_user?userId=user_123
X-Tenant-API-Key: your-api-key
```

## Location Management

### Get Location
```http
GET /api/mcp/get_location
X-Tenant-API-Key: your-api-key
```

### Update Location
```http
POST /api/mcp/update_location
X-Tenant-API-Key: your-api-key
Content-Type: application/json

{
  "name": "Main Office",
  "address": "123 Main St",
  "timezone": "America/New_York"
}
```

## Forms & Surveys

### Get Forms
```http
GET /api/mcp/get_forms
X-Tenant-API-Key: your-api-key
```

### Get Form Submissions
```http
GET /api/mcp/get_form_submissions?formId=form_123
X-Tenant-API-Key: your-api-key
```

### Get Surveys
```http
GET /api/mcp/get_surveys
X-Tenant-API-Key: your-api-key
```

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": {
    // Tool-specific response data
  },
  "metadata": {
    "tool": "tool_name",
    "tenantId": "tenant_123",
    "timestamp": "2024-01-01T00:00:00Z",
    "responseTime": "125ms"
  }
}
```

## Usage Tracking

Every API call is tracked for:
- Request/response size
- Processing time
- Token usage (for billing)
- Success/failure status

Usage data is available through your tenant dashboard.

## Best Practices

1. **Batch Operations**: Use bulk endpoints when available
2. **Pagination**: Always paginate large result sets
3. **Error Handling**: Implement exponential backoff for rate limits
4. **Caching**: Cache frequently accessed data client-side
5. **Webhooks**: Use webhooks for real-time updates instead of polling

## SDK Examples

### JavaScript/Node.js
```javascript
const GHLMCPClient = require('@your-org/ghl-mcp-client');

const client = new GHLMCPClient({
  apiKey: 'your-tenant-api-key',
  baseUrl: 'https://your-domain.vercel.app'
});

// Search contacts
const contacts = await client.mcp.searchContacts({
  query: 'john',
  limit: 10
});

// Create opportunity
const opportunity = await client.mcp.createOpportunity({
  contactId: 'contact_123',
  title: 'New Deal',
  value: 5000
});
```

### Python
```python
from ghl_mcp_client import GHLMCPClient

client = GHLMCPClient(
    api_key='your-tenant-api-key',
    base_url='https://your-domain.vercel.app'
)

# Search contacts
contacts = client.mcp.search_contacts(query='john', limit=10)

# Create opportunity
opportunity = client.mcp.create_opportunity(
    contact_id='contact_123',
    title='New Deal',
    value=5000
)
```

## Support

- **Documentation**: https://your-domain.com/docs
- **API Status**: https://status.your-domain.com
- **Support Email**: support@your-domain.com
- **GitHub**: https://github.com/your-org/ghl-mcp-platform