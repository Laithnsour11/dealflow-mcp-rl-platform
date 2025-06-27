# 📖 GoHighLevel MCP Platform - Complete API Reference

## Base URL
```
https://your-domain.vercel.app
```

## Authentication

All API requests require authentication via the `X-Tenant-API-Key` header:

```bash
curl -X POST https://your-domain.vercel.app/api/mcp/[tool_name] \
  -H "X-Tenant-API-Key: your_tenant_api_key" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## MCP Endpoints - All 269 Tools

### Contact Management (31 tools)

#### search_contacts
Search for contacts in the system.
```bash
POST /api/mcp/search_contacts
{
  "query": "john",
  "limit": 10,
  "offset": 0
}
```

#### get_contact
Get a specific contact by ID.
```bash
POST /api/mcp/get_contact
{
  "contactId": "contact_ABC123"
}
```

#### create_contact
Create a new contact.
```bash
POST /api/mcp/create_contact
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "customFields": {
    "field1": "value1"
  }
}
```

#### update_contact
Update an existing contact.
```bash
POST /api/mcp/update_contact
{
  "contactId": "contact_ABC123",
  "firstName": "Jane",
  "customFields": {
    "field2": "value2"
  }
}
```

#### delete_contact
Delete a contact.
```bash
POST /api/mcp/delete_contact
{
  "contactId": "contact_ABC123"
}
```

#### upsert_contact
Create or update a contact based on email/phone.
```bash
POST /api/mcp/upsert_contact
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### add_contact_tags
Add tags to a contact.
```bash
POST /api/mcp/add_contact_tags
{
  "contactId": "contact_ABC123",
  "tags": ["hot-lead", "interested"]
}
```

#### remove_contact_tags
Remove tags from a contact.
```bash
POST /api/mcp/remove_contact_tags
{
  "contactId": "contact_ABC123",
  "tags": ["cold-lead"]
}
```

#### get_contact_tasks
Get tasks for a contact.
```bash
POST /api/mcp/get_contact_tasks
{
  "contactId": "contact_ABC123"
}
```

#### create_contact_task
Create a task for a contact.
```bash
POST /api/mcp/create_contact_task
{
  "contactId": "contact_ABC123",
  "title": "Follow up call",
  "dueDate": "2024-12-31",
  "description": "Call to discuss proposal"
}
```

[Additional contact tools continue...]

### Messaging & Conversations (20 tools)

#### send_sms
Send an SMS message.
```bash
POST /api/mcp/send_sms
{
  "contactId": "contact_ABC123",
  "message": "Hello! This is a test message."
}
```

#### send_email
Send an email.
```bash
POST /api/mcp/send_email
{
  "contactId": "contact_ABC123",
  "subject": "Important Update",
  "body": "Hi there, here's your update...",
  "attachments": []
}
```

#### send_whatsapp
Send a WhatsApp message.
```bash
POST /api/mcp/send_whatsapp
{
  "contactId": "contact_ABC123",
  "message": "Hello via WhatsApp!"
}
```

[Additional messaging tools continue...]

### Invoices & Billing (39 tools)

#### create_invoice
Create a new invoice.
```bash
POST /api/mcp/create_invoice
{
  "contactId": "contact_ABC123",
  "items": [
    {
      "name": "Consulting Service",
      "price": 500.00,
      "quantity": 2
    }
  ],
  "dueDate": "2024-12-31",
  "currency": "USD"
}
```

#### send_invoice
Send an invoice to contact.
```bash
POST /api/mcp/send_invoice
{
  "invoiceId": "inv_123",
  "sendEmail": true,
  "sendSms": false
}
```

#### record_invoice_payment
Record a payment for an invoice.
```bash
POST /api/mcp/record_invoice_payment
{
  "invoiceId": "inv_123",
  "amount": 1000.00,
  "paymentDate": "2024-06-27",
  "paymentMethod": "card"
}
```

[Additional invoice tools continue...]

### Payments (20 tools)

#### list_orders
List all orders.
```bash
POST /api/mcp/list_orders
{
  "limit": 20,
  "offset": 0,
  "status": "completed"
}
```

#### create_coupon
Create a discount coupon.
```bash
POST /api/mcp/create_coupon
{
  "code": "SUMMER20",
  "discountType": "percentage",
  "discountValue": 20,
  "expiryDate": "2024-08-31"
}
```

[Additional payment tools continue...]

### Social Media (17 tools)

#### create_social_post
Create a social media post.
```bash
POST /api/mcp/create_social_post
{
  "platforms": ["facebook", "instagram"],
  "content": "Check out our latest offer!",
  "mediaUrls": ["https://example.com/image.jpg"],
  "scheduledTime": "2024-06-28T10:00:00Z"
}
```

#### get_social_accounts
Get connected social accounts.
```bash
POST /api/mcp/get_social_accounts
{}
```

[Additional social media tools continue...]

### Users & Teams (15 tools)

#### create_user
Create a new user.
```bash
POST /api/mcp/create_user
{
  "email": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "role": "agent",
  "permissions": ["contacts.read", "contacts.write"]
}
```

#### update_user_permissions
Update user permissions.
```bash
POST /api/mcp/update_user_permissions
{
  "userId": "user_123",
  "permissions": ["contacts.read", "contacts.write", "invoices.read"]
}
```

[Additional user tools continue...]

### Custom Objects (9 tools)

#### create_object_schema
Create a custom object schema.
```bash
POST /api/mcp/create_object_schema
{
  "name": "Properties",
  "fields": [
    {
      "name": "address",
      "type": "string",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "required": true
    }
  ]
}
```

#### create_object_record
Create a custom object record.
```bash
POST /api/mcp/create_object_record
{
  "objectType": "properties",
  "data": {
    "address": "123 Main St",
    "price": 250000
  }
}
```

[Additional custom object tools continue...]

## RL Analysis Endpoints

### /api/rl/analyze
Analyze a full conversation for insights.
```bash
POST /api/rl/analyze
{
  "conversation": [
    {
      "speaker": "customer",
      "message": "I need to sell my house quickly"
    },
    {
      "speaker": "agent",
      "message": "I understand. What's your timeline?"
    }
  ],
  "metadata": {
    "contactId": "contact_ABC123",
    "conversationType": "real_estate"
  }
}

Response:
{
  "success": true,
  "data": {
    "finalProbability": 0.78,
    "confidence": 0.92,
    "personalityType": "D",
    "motivationType": "financial_distress",
    "recommendations": [
      "Focus on speed of transaction",
      "Emphasize cash offer benefits"
    ]
  }
}
```

### /api/rl/real-time
Get real-time guidance during conversation.
```bash
POST /api/rl/real-time
{
  "conversationSoFar": [...],
  "lastMessage": {
    "speaker": "customer",
    "message": "What's your best offer?"
  }
}

Response:
{
  "success": true,
  "data": {
    "suggestedResponse": "Based on comparable sales...",
    "confidence": 0.88,
    "reasoning": "Customer showing buying signals"
  }
}
```

### /api/rl/compare
Compare different conversation approaches.
```bash
POST /api/rl/compare
{
  "baseConversation": [...],
  "variations": [
    {
      "id": "aggressive",
      "messages": [...]
    },
    {
      "id": "consultative",
      "messages": [...]
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "rankings": [
      {
        "id": "consultative",
        "score": 0.84
      },
      {
        "id": "aggressive",
        "score": 0.62
      }
    ]
  }
}
```

## Admin Endpoints

### /api/admin/init-db
Initialize the database (first-time setup).
```bash
POST /api/admin/init-db
Headers:
  X-Admin-Key: your_admin_key
```

### /api/health
Check platform health.
```bash
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-06-27T10:00:00Z",
  "environment": "production",
  "message": "GHL MCP + RL Platform is running"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Missing authentication |
| `INVALID_API_KEY` | Invalid tenant API key |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INVALID_PARAMS` | Invalid request parameters |
| `GHL_API_ERROR` | GoHighLevel API error |
| `NOT_FOUND` | Resource not found |
| `INTERNAL_ERROR` | Server error |

## Rate Limits

- **Default**: 100 requests per minute
- **Burst**: Up to 10 requests per second
- **Headers**: 
  - `X-RateLimit-Limit`: Your limit
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Reset timestamp

## Webhooks

Configure webhooks to receive real-time updates:

```bash
POST /api/webhooks/configure
{
  "url": "https://your-app.com/webhook",
  "events": ["contact.created", "contact.updated", "invoice.paid"],
  "secret": "your_webhook_secret"
}
```

## SDKs & Libraries

### JavaScript/TypeScript
```javascript
import { MCPClient } from '@ghl-mcp/sdk';

const client = new MCPClient({
  apiKey: 'your_tenant_key',
  baseUrl: 'https://your-domain.vercel.app'
});

// Search contacts
const contacts = await client.contacts.search({ query: 'john' });

// Send SMS
await client.messaging.sendSMS({
  contactId: 'contact_123',
  message: 'Hello!'
});
```

### Python
```python
from ghl_mcp import MCPClient

client = MCPClient(
    api_key='your_tenant_key',
    base_url='https://your-domain.vercel.app'
)

# Search contacts
contacts = client.contacts.search(query='john')

# Create invoice
invoice = client.invoices.create(
    contact_id='contact_123',
    items=[{'name': 'Service', 'price': 100}]
)
```

## Testing

Use our sandbox environment for testing:
- Base URL: `https://sandbox.your-domain.vercel.app`
- Test API Key: `test_key_ABC123`
- No charges for API calls
- Data resets daily

## Support

- **Documentation**: This guide
- **API Status**: https://status.your-domain.com
- **GitHub Issues**: https://github.com/your-repo/issues
- **Email**: api-support@your-domain.com