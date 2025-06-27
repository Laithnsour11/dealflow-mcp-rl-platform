# GoHighLevel MCP Platform - LLM Context Documentation

## System Overview

This is a comprehensive Multi-tenant GoHighLevel Model Context Protocol (MCP) integration platform with Reinforcement Learning capabilities. The platform provides access to all 269 GoHighLevel API tools through a unified interface, supporting both OAuth 2.0 (for marketplace apps) and Private Integration Keys.

## Architecture

```
Client Request → MCP Endpoint → Tenant Authentication → GHL Client (269 tools) → GoHighLevel API
                                           ↓
                                    RL Analysis System
```

## Core Components

### 1. MCP Endpoint Handler
- **Location**: `/api/mcp/[...tool]/route.ts`
- **Purpose**: Routes MCP tool requests to appropriate GHL client methods
- **Authentication**: Multi-tenant via API keys
- **Tools**: Maps 269 MCP tool names to GHL client methods

### 2. Tenant GHL Client V2
- **Location**: `/lib/ghl/tenant-client-v2.ts`
- **Purpose**: Implements all 269 GoHighLevel API operations
- **Structure**: Modular with specialized tool classes
- **Categories**: Contacts, Messaging, Invoices, Payments, Social Media, Users, Custom Objects, etc.

### 3. Authentication System
- **OAuth 2.0**: Full marketplace app support with token management
- **Private Keys**: Direct API key authentication
- **Encryption**: AES-256 for token storage
- **Multi-tenant**: Complete isolation between tenants

### 4. RL Integration
- **Accuracy**: 96.7% for lead qualification
- **Features**: DISC personality detection, motivation analysis, conversation scoring
- **Endpoints**: `/api/rl/analyze`, `/api/rl/real-time`, `/api/rl/compare`

## Available Tools (269 Total)

### Contact Management (31 tools)
- `search_contacts`, `get_contact`, `create_contact`, `update_contact`, `delete_contact`
- `upsert_contact`, `get_duplicate_contact`, `merge_contacts`
- Tags: `add_contact_tags`, `remove_contact_tags`, `bulk_update_contact_tags`
- Tasks: `get_contact_tasks`, `create_contact_task`, `update_contact_task`, `delete_contact_task`
- Notes: `get_contact_notes`, `create_contact_note`, `update_contact_note`, `delete_contact_note`
- Workflows: `add_contact_to_workflow`, `remove_contact_from_workflow`
- And more...

### Messaging & Conversations (20 tools)
- `search_conversations`, `get_conversation`, `create_conversation`
- `send_sms`, `send_email`, `send_whatsapp`, `send_facebook_message`, `send_instagram_message`
- `get_message`, `get_email_message`, `upload_message_attachments`
- `update_message_status`, `cancel_scheduled_message`
- And more...

### Invoices & Billing (39 tools)
- Templates: `create_invoice_template`, `list_invoice_templates`, `update_invoice_template`
- Invoices: `create_invoice`, `send_invoice`, `void_invoice`, `record_invoice_payment`
- Estimates: `create_estimate`, `send_estimate`, `create_invoice_from_estimate`
- Schedules: `create_invoice_schedule`, `auto_payment_invoice_schedule`
- And more...

### Payments (20 tools)
- Orders: `list_orders`, `get_order_by_id`, `create_order_fulfillment`
- Subscriptions: `list_subscriptions`, `get_subscription_by_id`
- Coupons: `create_coupon`, `update_coupon`, `delete_coupon`
- Custom Providers: `create_custom_provider_integration`
- And more...

### Social Media (17 tools)
- Posts: `create_social_post`, `update_social_post`, `bulk_delete_social_posts`
- Accounts: `get_social_accounts`, `start_social_oauth`
- Analytics: `get_social_tags`, `review_social_post`
- And more...

### Users & Teams (15 tools)
- `get_users`, `create_user`, `update_user`, `delete_user`
- Permissions: `get_user_permissions`, `update_user_permissions`
- Roles: `get_user_roles`, `assign_user_role`, `remove_user_role`
- Teams: `get_teams`, `create_team`, `update_team`, `delete_team`

### Custom Objects (9 tools)
- `get_all_objects`, `create_object_schema`, `get_object_schema`
- Records: `create_object_record`, `get_object_record`, `update_object_record`
- Search: `search_object_records`

## API Usage Examples

### Basic Contact Search
```javascript
// MCP Request
POST /api/mcp/search_contacts
Headers:
  X-Tenant-API-Key: tenant_key_here
  Content-Type: application/json
Body: {
  "query": "john",
  "limit": 10
}
```

### Create Invoice
```javascript
POST /api/mcp/create_invoice
Headers:
  X-Tenant-API-Key: tenant_key_here
Body: {
  "contactId": "contact_123",
  "items": [{
    "name": "Service",
    "price": 100.00,
    "quantity": 1
  }],
  "dueDate": "2024-12-31"
}
```

### RL Analysis
```javascript
POST /api/rl/analyze
Headers:
  X-Tenant-API-Key: tenant_key_here
Body: {
  "conversation": [
    {"speaker": "customer", "message": "I need to sell quickly"},
    {"speaker": "agent", "message": "I can help with that..."}
  ]
}
```

## Authentication Flow

### OAuth 2.0
1. User visits `/onboarding`
2. Clicks "Connect with GoHighLevel"
3. Redirected to GHL for authorization
4. GHL redirects back with auth code
5. Platform exchanges code for tokens
6. Tokens encrypted and stored

### Private Integration Key
1. User visits `/onboarding/private-key`
2. Enters API key and location ID
3. Platform validates and stores encrypted

## Security Features

- **Encryption**: AES-256 for all sensitive data
- **Multi-tenancy**: Complete data isolation
- **Rate Limiting**: Per-tenant limits
- **Audit Logging**: All API calls tracked
- **CORS**: Configurable origin restrictions

## Database Schema

### Core Tables
- `tenants`: Multi-tenant management
- `usage_records`: API usage tracking
- `oauth_installations`: OAuth token storage
- `rl_analyses`: RL results (anonymized)
- `conversion_outcomes`: Deal tracking

## Environment Configuration

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=...
API_KEY_SALT=...
ENCRYPTION_KEY=... (32 chars)
GHL_OAUTH_CLIENT_ID=...
GHL_OAUTH_CLIENT_SECRET=...

# Optional
RL_API_URL=...
NEXT_PUBLIC_APP_URL=...
```

## Deployment

- **Platform**: Vercel (Next.js 14)
- **Database**: PostgreSQL (Neon)
- **Runtime**: Node.js 18+
- **Framework**: React with TypeScript

## Performance Metrics

- **Response Time**: <100ms average
- **Uptime**: 99.9% SLA
- **Concurrent Requests**: 1000+
- **RL Processing**: <500ms per conversation

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limits

- **Default**: 100 requests/minute
- **Enterprise**: 1000 requests/minute
- **Per-endpoint limits available**

## Webhook Support

Platform can receive webhooks from:
- GoHighLevel events
- Payment processors
- RL system updates

## Best Practices

1. **Always use tenant API keys** for authentication
2. **Implement retry logic** for transient failures
3. **Cache frequently accessed data** (contacts, pipelines)
4. **Use webhooks** for real-time updates
5. **Monitor rate limits** to avoid throttling

## Integration Patterns

### Direct API Usage
Best for: Simple integrations, testing
```javascript
fetch('/api/mcp/tool_name', {
  method: 'POST',
  headers: { 'X-Tenant-API-Key': key },
  body: JSON.stringify(data)
})
```

### SDK Pattern
Best for: Complex applications
```javascript
const mcp = new MCPClient(apiKey);
const contacts = await mcp.contacts.search({ query: 'john' });
```

### Webhook Pattern
Best for: Real-time updates
```javascript
// Configure webhook in GHL
// Platform receives and processes events
```

## Support Resources

- API Reference: `/docs/API-REFERENCE.md`
- Developer Guide: `/docs/DEVELOPER-GUIDE.md`
- Marketplace Guide: `/docs/MARKETPLACE-APP-CREATION-GUIDE.md`
- Schema: `/src/lib/db/schema.sql`