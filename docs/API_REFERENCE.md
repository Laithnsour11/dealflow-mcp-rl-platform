# GoHighLevel MCP API Reference

## Table of Contents
1. [Authentication](#authentication)
2. [Base Configuration](#base-configuration)
3. [API Endpoints](#api-endpoints)
   - [Contacts API](#contacts-api)
   - [Conversations API](#conversations-api)
   - [Calendar API](#calendar-api)
   - [Opportunities API](#opportunities-api)
   - [Locations API](#locations-api)
   - [Users API](#users-api)
   - [Forms & Surveys API](#forms--surveys-api)
   - [Social Media API](#social-media-api)
   - [Invoices & Payments API](#invoices--payments-api)
   - [Custom Objects API](#custom-objects-api)
   - [And more...](#additional-apis)
4. [Error Handling](#error-handling)
5. [Rate Limits](#rate-limits)
6. [Examples](#examples)

## Authentication

All API requests require authentication using the `X-Tenant-API-Key` header:

```bash
curl https://dealflow-mcp-rl-platform.vercel.app/api/mcp/search_contacts \
  -H "X-Tenant-API-Key: ghl_mcp_xxxxxxxxxxxxx"
```

### Getting Your API Key
1. Complete the OAuth flow at `/api/auth/platform/start`
2. Your API key will be displayed on the success page
3. Store it securely - it won't be shown again

## Base Configuration

- **Base URL**: `https://dealflow-mcp-rl-platform.vercel.app/api/mcp`
- **GHL API Base**: `https://services.leadconnectorhq.com`
- **Content-Type**: `application/json`
- **API Version**: `2021-07-28`

## API Endpoints

### Contacts API

#### Search Contacts
```http
GET /api/mcp/search_contacts
```

Query Parameters:
- `query` - Search query
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset
- `sortBy` - Sort field
- `order` - Sort order (asc/desc)

Example:
```bash
curl "https://dealflow-mcp-rl-platform.vercel.app/api/mcp/search_contacts?query=john&limit=10" \
  -H "X-Tenant-API-Key: YOUR_API_KEY"
```

#### Get Contact
```http
GET /api/mcp/get_contact
```

Query Parameters:
- `contactId` - Contact ID (required)

#### Create Contact
```http
POST /api/mcp/create_contact
```

Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "website": "https://example.com",
  "source": "API",
  "customField": {
    "field_key": "value"
  },
  "tags": ["tag1", "tag2"]
}
```

#### Update Contact
```http
POST /api/mcp/update_contact
```

Request Body:
```json
{
  "contactId": "contact_123",
  "firstName": "Jane",
  "customField": {
    "updated_field": "new_value"
  }
}
```

#### Delete Contact
```http
POST /api/mcp/delete_contact
```

Request Body:
```json
{
  "contactId": "contact_123"
}
```

#### Contact Tags
```http
POST /api/mcp/add_contact_tags
POST /api/mcp/remove_contact_tags
```

Request Body:
```json
{
  "contactId": "contact_123",
  "tags": ["tag1", "tag2"]
}
```

#### Contact Notes
```http
GET /api/mcp/get_contact_notes
POST /api/mcp/create_contact_note
POST /api/mcp/update_contact_note
POST /api/mcp/delete_contact_note
```

Create Note Example:
```json
{
  "contactId": "contact_123",
  "body": "This is a note about the contact",
  "userId": "user_123"
}
```

#### Contact Tasks
```http
GET /api/mcp/get_contact_tasks
POST /api/mcp/create_contact_task
POST /api/mcp/update_contact_task
POST /api/mcp/delete_contact_task
```

Create Task Example:
```json
{
  "contactId": "contact_123",
  "title": "Follow up call",
  "body": "Call to discuss proposal",
  "dueDate": "2024-01-15T10:00:00Z",
  "assignedTo": "user_123"
}
```

#### Contact Custom Fields
```http
GET /api/mcp/get_contact_custom_fields
POST /api/mcp/update_contact_custom_fields
```

Update Custom Fields Example:
```json
{
  "contactId": "contact_123",
  "customFields": {
    "lead_score": 85,
    "industry": "Technology",
    "company_size": "50-100"
  }
}
```

### Conversations API

#### Search Conversations
```http
GET /api/mcp/search_conversations
```

Query Parameters:
- `contactId` - Filter by contact
- `assignedTo` - Filter by assigned user
- `limit` - Number of results
- `lastMessageAfter` - Filter by last message date
- `lastMessageBefore` - Filter by last message date

#### Get Conversation
```http
GET /api/mcp/get_conversation
```

Query Parameters:
- `conversationId` - Conversation ID (required)

#### Send Messages
```http
POST /api/mcp/send_sms
POST /api/mcp/send_email
POST /api/mcp/send_whatsapp
POST /api/mcp/send_facebook_message
POST /api/mcp/send_instagram_message
```

Send SMS Example:
```json
{
  "contactId": "contact_123",
  "message": "Hello! This is a test message.",
  "scheduledAt": "2024-01-15T10:00:00Z" // Optional
}
```

Send Email Example:
```json
{
  "contactId": "contact_123",
  "subject": "Follow up on our call",
  "html": "<p>Hi there!</p><p>Thanks for your time today...</p>",
  "attachments": [
    {
      "url": "https://example.com/file.pdf",
      "filename": "proposal.pdf"
    }
  ]
}
```

### Calendar API

#### Get Calendars
```http
GET /api/mcp/get_calendars
```

#### Get Calendar Groups
```http
GET /api/mcp/get_calendar_groups
```

#### Get Free Slots
```http
GET /api/mcp/get_free_slots
```

Query Parameters:
- `calendarId` - Calendar ID
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `timezone` - Timezone (e.g., "America/New_York")

#### Create Appointment
```http
POST /api/mcp/create_appointment
```

Request Body:
```json
{
  "calendarId": "calendar_123",
  "contactId": "contact_123",
  "title": "Strategy Call",
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T15:00:00Z",
  "address": "123 Main St, New York, NY",
  "notes": "Discuss Q1 strategy",
  "appointmentStatus": "confirmed"
}
```

#### Update/Delete Appointment
```http
POST /api/mcp/update_appointment
POST /api/mcp/delete_appointment
```

### Opportunities API

#### Search Opportunities
```http
GET /api/mcp/search_opportunities
```

Query Parameters:
- `pipelineId` - Filter by pipeline
- `stageId` - Filter by stage
- `contactId` - Filter by contact
- `assignedTo` - Filter by user
- `status` - Filter by status (open/won/lost/abandoned)

#### Get Pipelines
```http
GET /api/mcp/get_pipelines
```

#### Create Opportunity
```http
POST /api/mcp/create_opportunity
```

Request Body:
```json
{
  "contactId": "contact_123",
  "name": "New Deal - John Doe",
  "pipelineId": "pipeline_123",
  "pipelineStageId": "stage_123",
  "monetaryValue": 50000,
  "assignedTo": "user_123",
  "status": "open",
  "customFields": {
    "probability": 0.75,
    "close_date": "2024-02-15"
  }
}
```

#### Update Opportunity Status
```http
POST /api/mcp/update_opportunity_status
```

Request Body:
```json
{
  "opportunityId": "opp_123",
  "status": "won"
}
```

### Locations API

#### Get Location
```http
GET /api/mcp/get_location
```

#### Update Location
```http
POST /api/mcp/update_location
```

#### Custom Fields Management
```http
GET /api/mcp/get_location_custom_fields
POST /api/mcp/create_location_custom_field
POST /api/mcp/update_location_custom_field
POST /api/mcp/delete_location_custom_field
```

Create Custom Field Example:
```json
{
  "name": "Lead Score",
  "dataType": "NUMBER",
  "position": 0,
  "placeholder": "Enter lead score",
  "acceptableValues": []
}
```

#### Tags Management
```http
GET /api/mcp/get_location_tags
POST /api/mcp/create_location_tag
POST /api/mcp/update_location_tag
POST /api/mcp/delete_location_tag
```

### Users API

#### List Users
```http
GET /api/mcp/get_users
```

#### User Management
```http
GET /api/mcp/get_user
POST /api/mcp/create_user
POST /api/mcp/update_user
POST /api/mcp/delete_user
```

Create User Example:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "role": "user",
  "permissions": {
    "contacts": ["read", "write"],
    "opportunities": ["read", "write"]
  }
}
```

### Forms & Surveys API

#### Forms
```http
GET /api/mcp/get_forms
POST /api/mcp/create_form
POST /api/mcp/update_form
POST /api/mcp/delete_form
GET /api/mcp/get_form_submissions
```

#### Surveys
```http
GET /api/mcp/get_surveys
POST /api/mcp/create_survey
POST /api/mcp/update_survey
POST /api/mcp/delete_survey
GET /api/mcp/get_survey_submissions
```

### Social Media API

#### Posts Management
```http
GET /api/mcp/search_social_posts
POST /api/mcp/create_social_post
GET /api/mcp/get_social_post
POST /api/mcp/update_social_post
POST /api/mcp/delete_social_post
```

Create Social Post Example:
```json
{
  "platforms": ["facebook", "instagram"],
  "content": "Check out our latest blog post!",
  "mediaUrls": ["https://example.com/image.jpg"],
  "scheduledAt": "2024-01-15T14:00:00Z",
  "tags": ["marketing", "blog"]
}
```

#### Social Accounts
```http
GET /api/mcp/get_social_accounts
POST /api/mcp/delete_social_account
GET /api/mcp/start_social_oauth
```

### Invoices & Payments API

#### Invoice Templates
```http
GET /api/mcp/list_invoice_templates
POST /api/mcp/create_invoice_template
GET /api/mcp/get_invoice_template
POST /api/mcp/update_invoice_template
POST /api/mcp/delete_invoice_template
```

#### Invoices
```http
GET /api/mcp/list_invoices
POST /api/mcp/create_invoice
GET /api/mcp/get_invoice
POST /api/mcp/update_invoice
POST /api/mcp/delete_invoice
POST /api/mcp/send_invoice
POST /api/mcp/void_invoice
POST /api/mcp/record_invoice_payment
```

Create Invoice Example:
```json
{
  "contactId": "contact_123",
  "name": "Invoice #001",
  "dueDate": "2024-02-01",
  "items": [
    {
      "name": "Consulting Services",
      "description": "January 2024",
      "price": 5000,
      "quantity": 1
    }
  ],
  "currency": "USD"
}
```

#### Payment Processing
```http
GET /api/mcp/list_orders
GET /api/mcp/list_transactions
GET /api/mcp/list_subscriptions
```

### Custom Objects API

#### Schema Management
```http
GET /api/mcp/get_all_objects
POST /api/mcp/create_object_schema
GET /api/mcp/get_object_schema
POST /api/mcp/update_object_schema
```

#### Records Management
```http
POST /api/mcp/create_object_record
GET /api/mcp/get_object_record
POST /api/mcp/update_object_record
POST /api/mcp/delete_object_record
POST /api/mcp/search_object_records
```

### Additional APIs

#### Workflows
```http
GET /api/mcp/get_workflows
POST /api/mcp/add_contact_to_workflow
POST /api/mcp/remove_contact_from_workflow
```

#### Campaigns
```http
GET /api/mcp/get_campaigns
```

#### Media/Files
```http
GET /api/mcp/get_media_library
POST /api/mcp/upload_file
```

#### Links (URL Shortener)
```http
POST /api/mcp/create_short_link
GET /api/mcp/get_short_links
POST /api/mcp/update_short_link
POST /api/mcp/delete_short_link
GET /api/mcp/get_link_analytics
```

#### RL Integration (Special)
```http
GET /api/mcp/get_conversation_transcripts
GET /api/mcp/get_contact_journey
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid or missing API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

Error Response Format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

## Rate Limits

- **Default Rate Limit**: 1000 requests per 15 minutes per tenant
- **Burst Limit**: 100 requests per minute
- **Rate Limit Headers**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Examples

### Complete Contact Creation Flow
```bash
# 1. Create a contact
curl -X POST https://dealflow-mcp-rl-platform.vercel.app/api/mcp/create_contact \
  -H "X-Tenant-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "tags": ["lead", "webinar"]
  }'

# 2. Add a note
curl -X POST https://dealflow-mcp-rl-platform.vercel.app/api/mcp/create_contact_note \
  -H "X-Tenant-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "contact_123",
    "body": "Interested in premium plan"
  }'

# 3. Create an opportunity
curl -X POST https://dealflow-mcp-rl-platform.vercel.app/api/mcp/create_opportunity \
  -H "X-Tenant-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "contact_123",
    "name": "Premium Plan - John Doe",
    "monetaryValue": 999,
    "pipelineId": "pipeline_123",
    "pipelineStageId": "stage_123"
  }'

# 4. Send follow-up email
curl -X POST https://dealflow-mcp-rl-platform.vercel.app/api/mcp/send_email \
  -H "X-Tenant-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "contact_123",
    "subject": "Welcome to our platform!",
    "html": "<p>Hi John,</p><p>Thanks for your interest...</p>"
  }'
```

### JavaScript/TypeScript SDK Example
```typescript
const GHL_MCP_API = {
  baseURL: 'https://dealflow-mcp-rl-platform.vercel.app/api/mcp',
  apiKey: 'YOUR_API_KEY',
  
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      ...options,
      headers: {
        'X-Tenant-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }
    
    return response.json();
  },
  
  contacts: {
    search: (params) => GHL_MCP_API.request('search_contacts?' + new URLSearchParams(params)),
    get: (contactId) => GHL_MCP_API.request(`get_contact?contactId=${contactId}`),
    create: (data) => GHL_MCP_API.request('create_contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (contactId, data) => GHL_MCP_API.request('update_contact', {
      method: 'POST',
      body: JSON.stringify({ contactId, ...data }),
    }),
  },
  
  conversations: {
    search: (params) => GHL_MCP_API.request('search_conversations?' + new URLSearchParams(params)),
    sendSMS: (data) => GHL_MCP_API.request('send_sms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    sendEmail: (data) => GHL_MCP_API.request('send_email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
};

// Usage
const contacts = await GHL_MCP_API.contacts.search({ query: 'john' });
const newContact = await GHL_MCP_API.contacts.create({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
});
```

## Need Help?

- **GitHub Issues**: [Report issues](https://github.com/Laithnsour11/dealflow-mcp-rl-platform/issues)
- **API Status**: Check `/api/health` endpoint
- **Support**: Contact your administrator