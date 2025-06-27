# GoHighLevel MCP Server Context for LLMs

## System Overview

You have access to a Multi-tenant GoHighLevel MCP (Model Context Protocol) Server that provides secure access to 269+ CRM operations. This system allows you to manage contacts, conversations, opportunities, calendars, tasks, and more through a unified API interface.

## Authentication

**IMPORTANT**: Always include the tenant API key in your requests:
```
X-Tenant-API-Key: [provided by user]
```

## Available Tools

You can access the following categories of tools:

### 1. Contact Management (45 tools)
- **search_contacts**: Search for contacts by query
- **get_contact**: Get specific contact by ID
- **create_contact**: Create new contact with details
- **update_contact**: Update existing contact
- **delete_contact**: Remove contact from system
- **add_contact_tags**: Add tags to categorize contacts
- **remove_contact_tags**: Remove tags from contacts

### 2. Conversation Management (15 tools)
- **get_conversations**: List all conversations
- **get_conversation**: Get specific conversation
- **send_message**: Send message in conversation
- **get_conversation_transcripts**: Get full conversation history

### 3. Opportunity Management (20 tools)
- **get_opportunities**: List opportunities/deals
- **create_opportunity**: Create new opportunity
- **update_opportunity**: Update opportunity details
- **delete_opportunity**: Remove opportunity
- **move_opportunity_stage**: Move through pipeline stages
- **get_pipelines**: List available pipelines
- **get_stages**: Get stages for a pipeline

### 4. Calendar & Scheduling (15 tools)
- **get_calendars**: List available calendars
- **get_appointments**: Get appointments in date range
- **create_appointment**: Schedule new appointment
- **update_appointment**: Modify appointment
- **delete_appointment**: Cancel appointment

### 5. Task Management (10 tools)
- **get_tasks**: List tasks
- **create_task**: Create new task
- **update_task**: Modify task details
- **complete_task**: Mark task as done
- **delete_task**: Remove task

### 6. Notes & Documentation
- **get_notes**: Get notes for a contact
- **create_note**: Add note to contact
- **update_note**: Modify existing note
- **delete_note**: Remove note

### 7. Workflow Automation
- **trigger_workflow**: Start automated workflow
- **get_workflows**: List available workflows

### 8. Campaign Management
- **get_campaigns**: List campaigns
- **add_contact_to_campaign**: Enroll contact
- **remove_contact_from_campaign**: Remove from campaign

### 9. Custom Fields & Values
- **get_custom_fields**: List custom field definitions
- **get_custom_values**: Get contact's custom values
- **update_custom_values**: Set custom field values

### 10. Analytics & Reporting
- **get_analytics**: Get analytics data
- **get_reporting_data**: Generate reports

## Request Formats

### GET Requests
```
GET /api/mcp/{tool_name}?param1=value1&param2=value2
X-Tenant-API-Key: {api_key}
```

### POST Requests
```
POST /api/mcp/{tool_name}
X-Tenant-API-Key: {api_key}
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

## Common Operations Examples

### 1. Finding and Creating Contacts
```javascript
// Search for existing contact
GET /api/mcp/search_contacts?query=john.doe@example.com

// If not found, create new contact
POST /api/mcp/create_contact
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "tags": ["lead", "website"]
}
```

### 2. Managing Opportunities
```javascript
// Create opportunity for contact
POST /api/mcp/create_opportunity
{
  "contactId": "contact_123",
  "title": "Website Redesign Project",
  "value": 5000,
  "pipelineId": "pipeline_123",
  "stageId": "stage_initial"
}

// Move to next stage
POST /api/mcp/move_opportunity_stage
{
  "opportunityId": "opp_456",
  "stageId": "stage_negotiation"
}
```

### 3. Scheduling Appointments
```javascript
// Check calendar availability
GET /api/mcp/get_appointments?startDate=2024-01-15&endDate=2024-01-15

// Book appointment
POST /api/mcp/create_appointment
{
  "contactId": "contact_123",
  "title": "Discovery Call",
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T14:30:00Z",
  "appointmentStatus": "confirmed"
}
```

### 4. Conversation Management
```javascript
// Get conversation history
GET /api/mcp/get_conversations?contactId=contact_123

// Send follow-up message
POST /api/mcp/send_message
{
  "conversationId": "conv_789",
  "message": "Hi John, following up on our discussion about the project timeline."
}
```

## Important Considerations

### 1. Data Isolation
- Each tenant's data is completely isolated
- You cannot access data from other tenants
- All operations are scoped to the authenticated tenant

### 2. Rate Limits
- Default: 1000 requests per 15 minutes
- Monitor rate limit headers in responses
- Implement exponential backoff on 429 errors

### 3. Error Handling
Always check for errors:
```json
{
  "success": false,
  "error": "Contact not found",
  "details": {
    "code": "NOT_FOUND",
    "contactId": "invalid_id"
  }
}
```

### 4. Best Practices
- **Validate IDs**: Ensure contactId, opportunityId, etc. exist before operations
- **Use Tags**: Organize contacts with meaningful tags
- **Track Conversations**: Log all customer interactions
- **Update Opportunities**: Keep pipeline stages current
- **Set Tasks**: Create follow-up tasks for important actions

## Common Workflows

### Lead Qualification Workflow
1. **Create/Update Contact**: Store lead information
2. **Add Tags**: Tag as "lead", "unqualified"
3. **Create Opportunity**: Track in pipeline
4. **Schedule Call**: Book discovery appointment
5. **Create Task**: Set follow-up reminder
6. **Send Message**: Confirmation email/SMS

### Customer Onboarding Workflow
1. **Update Contact**: Mark as customer
2. **Move Opportunity**: Update to "Won" stage
3. **Trigger Workflow**: Start onboarding automation
4. **Create Tasks**: Setup checklist items
5. **Schedule Appointments**: Onboarding calls
6. **Add to Campaign**: Enrollment emails

### Follow-up Sequence
1. **Get Contact**: Retrieve contact details
2. **Check Conversations**: Review last interaction
3. **Send Message**: Personalized follow-up
4. **Create Note**: Log interaction details
5. **Update Custom Fields**: Track engagement
6. **Set Task**: Next follow-up date

## Advanced Features

### Custom Field Management
```javascript
// Define scoring system
POST /api/mcp/update_custom_values
{
  "contactId": "contact_123",
  "customFields": {
    "lead_score": 85,
    "engagement_level": "high",
    "last_interaction": "2024-01-10",
    "preferred_contact_method": "email"
  }
}
```

### Bulk Operations
When handling multiple records:
1. Use pagination (limit parameter)
2. Process in batches
3. Handle partial failures
4. Log results for audit

### Analytics Integration
```javascript
// Get conversion metrics
GET /api/mcp/get_analytics?
  startDate=2024-01-01&
  endDate=2024-01-31&
  metrics=conversion_rate,revenue,activities

// Generate opportunity report
GET /api/mcp/get_reporting_data?
  reportType=opportunity_pipeline&
  groupBy=stage&
  period=this_month
```

## Security Notes

1. **API Keys are sensitive** - Never expose in client-side code
2. **Validate all inputs** - Sanitize data before sending
3. **Use HTTPS only** - All requests must be encrypted
4. **Monitor usage** - Track API calls for anomalies
5. **Rotate keys regularly** - Update API keys periodically

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check API key is correct and active
2. **404 Not Found**: Verify tool name and resource IDs
3. **429 Too Many Requests**: Implement rate limiting
4. **400 Bad Request**: Validate request parameters
5. **500 Server Error**: Retry with exponential backoff

### Debug Information:
- All responses include metadata with timing
- Check responseTime for performance issues
- Use tool discovery endpoint to verify available tools
- Monitor usage statistics for optimization

## Integration Tips

1. **Cache frequently used data** (contacts, pipelines, custom fields)
2. **Use webhooks for real-time updates** instead of polling
3. **Batch operations** when possible
4. **Implement retry logic** with backoff
5. **Log all operations** for debugging
6. **Monitor rate limits** proactively

This MCP server provides comprehensive CRM functionality with enterprise-grade security and reliability. Use it to build powerful automations and integrations while maintaining data isolation and security.