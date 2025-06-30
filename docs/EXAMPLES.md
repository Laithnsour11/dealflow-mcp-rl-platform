# GoHighLevel MCP Platform - Usage Examples

This guide provides practical examples for using the GoHighLevel MCP Platform API.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Contact Management](#contact-management)
3. [Conversations & Messaging](#conversations--messaging)
4. [Calendar & Appointments](#calendar--appointments)
5. [Opportunities & Pipelines](#opportunities--pipelines)
6. [Invoices & Payments](#invoices--payments)
7. [Custom Fields](#custom-fields)
8. [Advanced Workflows](#advanced-workflows)

## Getting Started

### Setting Up Your Client

#### JavaScript/TypeScript
```typescript
class GHLClient {
  constructor(private apiKey: string) {
    this.baseURL = 'https://dealflow-mcp-rl-platform.vercel.app/api/mcp';
  }

  async request(endpoint: string, data?: any) {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      method: data ? 'POST' : 'GET',
      headers: {
        'X-Tenant-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  }
}

const client = new GHLClient('ghl_mcp_your_api_key_here');
```

#### Python
```python
import requests

class GHLClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://dealflow-mcp-rl-platform.vercel.app/api/mcp'
        
    def request(self, endpoint, data=None):
        headers = {
            'X-Tenant-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        if data:
            response = requests.post(f"{self.base_url}/{endpoint}", json=data, headers=headers)
        else:
            response = requests.get(f"{self.base_url}/{endpoint}", headers=headers)
            
        response.raise_for_status()
        return response.json()

client = GHLClient('ghl_mcp_your_api_key_here')
```

## Contact Management

### Search Contacts
```javascript
// Search by name
const contacts = await client.request('search_contacts', {
  query: 'John Doe',
  limit: 10
});

// Search by email
const emailSearch = await client.request('search_contacts', {
  email: 'john@example.com'
});

// Search with filters
const filtered = await client.request('search_contacts', {
  tags: ['lead', 'hot'],
  dateAdded: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
});
```

### Create Contact with Full Details
```javascript
const newContact = await client.request('create_contact', {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  phone: '+1234567890',
  address1: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  website: 'https://janesmith.com',
  source: 'Website Form',
  tags: ['new-lead', 'webinar-attendee'],
  customField: {
    lead_score: 85,
    preferred_contact_method: 'email',
    budget_range: '$50k-$100k'
  }
});
```

### Update Contact
```javascript
// Update basic info
await client.request('update_contact', {
  contactId: 'contact_123',
  firstName: 'Jane',
  lastName: 'Smith-Johnson',
  email: 'jane.johnson@example.com'
});

// Update custom fields only
await client.request('update_contact_custom_fields', {
  contactId: 'contact_123',
  customFields: {
    lead_score: 95,
    last_interaction: new Date().toISOString(),
    deal_stage: 'negotiation'
  }
});
```

### Contact Tags Management
```javascript
// Add tags
await client.request('add_contact_tags', {
  contactId: 'contact_123',
  tags: ['vip', 'urgent-followup']
});

// Remove tags
await client.request('remove_contact_tags', {
  contactId: 'contact_123',
  tags: ['cold-lead']
});

// Bulk update tags
await client.request('bulk_update_contact_tags', {
  contactIds: ['contact_123', 'contact_456'],
  addTags: ['q1-campaign'],
  removeTags: ['old-campaign']
});
```

### Contact Notes
```javascript
// Add a note
const note = await client.request('create_contact_note', {
  contactId: 'contact_123',
  body: 'Had a great call with Jane. She\'s interested in the premium package and wants a demo next week.',
  userId: 'user_456' // Optional: assign to specific user
});

// Get all notes
const notes = await client.request('get_contact_notes', {
  contactId: 'contact_123'
});
```

### Contact Tasks
```javascript
// Create a task
const task = await client.request('create_contact_task', {
  contactId: 'contact_123',
  title: 'Schedule Demo Call',
  body: 'Schedule a 30-minute demo of premium features',
  dueDate: '2024-01-20T14:00:00Z',
  assignedTo: 'user_456',
  priority: 'high'
});

// Get tasks
const tasks = await client.request('get_contact_tasks', {
  contactId: 'contact_123',
  includeCompleted: false
});

// Update task
await client.request('update_contact_task', {
  contactId: 'contact_123',
  taskId: 'task_789',
  completed: true,
  completedDate: new Date().toISOString()
});
```

## Conversations & Messaging

### Send SMS
```javascript
// Simple SMS
await client.request('send_sms', {
  contactId: 'contact_123',
  message: 'Hi Jane! Just following up on our conversation. Are you available for a call tomorrow at 2 PM?'
});

// Scheduled SMS
await client.request('send_sms', {
  contactId: 'contact_123',
  message: 'Reminder: Our demo call is in 1 hour. Here\'s the link: https://meet.example.com/demo',
  scheduledAt: '2024-01-20T13:00:00Z'
});
```

### Send Email
```javascript
// HTML Email with attachments
await client.request('send_email', {
  contactId: 'contact_123',
  subject: 'Your Personalized Demo Proposal',
  html: `
    <h2>Hi Jane,</h2>
    <p>Thank you for your time today! As discussed, I'm attaching our proposal for the premium package.</p>
    <p>Key benefits for your business:</p>
    <ul>
      <li>Increase efficiency by 40%</li>
      <li>Reduce costs by $10,000/month</li>
      <li>24/7 dedicated support</li>
    </ul>
    <p>Looking forward to our next conversation!</p>
    <p>Best regards,<br>John</p>
  `,
  attachments: [
    {
      url: 'https://example.com/proposal.pdf',
      filename: 'Premium_Package_Proposal.pdf'
    }
  ]
});
```

### Send WhatsApp Message
```javascript
await client.request('send_whatsapp', {
  contactId: 'contact_123',
  message: 'Hi Jane! 👋 Thanks for connecting. I've sent you an email with our proposal. Let me know if you have any questions!',
  mediaUrl: 'https://example.com/infographic.png' // Optional
});
```

### Search Conversations
```javascript
// Get all conversations for a contact
const conversations = await client.request('search_conversations', {
  contactId: 'contact_123'
});

// Get recent conversations
const recent = await client.request('search_conversations', {
  lastMessageAfter: '2024-01-01T00:00:00Z',
  limit: 50
});

// Get unread conversations
const unread = await client.request('search_conversations', {
  unread: true,
  assignedTo: 'user_456'
});
```

## Calendar & Appointments

### Get Available Slots
```javascript
const slots = await client.request('get_free_slots', {
  calendarId: 'calendar_123',
  startDate: '2024-01-20',
  endDate: '2024-01-27',
  timezone: 'America/New_York'
});

console.log('Available slots:', slots.data);
```

### Create Appointment
```javascript
const appointment = await client.request('create_appointment', {
  calendarId: 'calendar_123',
  contactId: 'contact_123',
  title: 'Product Demo - Jane Smith',
  startTime: '2024-01-22T14:00:00Z',
  endTime: '2024-01-22T14:30:00Z',
  appointmentStatus: 'confirmed',
  notes: 'Demo premium features, discuss pricing',
  meetingLocation: 'https://zoom.us/j/123456789',
  reminders: [
    {
      type: 'email',
      time: 60 // 60 minutes before
    },
    {
      type: 'sms',
      time: 15 // 15 minutes before
    }
  ]
});
```

### Update Appointment
```javascript
// Reschedule
await client.request('update_appointment', {
  appointmentId: 'apt_123',
  startTime: '2024-01-23T15:00:00Z',
  endTime: '2024-01-23T15:30:00Z',
  notes: 'Rescheduled per client request'
});

// Cancel
await client.request('delete_appointment', {
  appointmentId: 'apt_123'
});
```

## Opportunities & Pipelines

### Get Pipelines
```javascript
const pipelines = await client.request('get_pipelines');
console.log('Available pipelines:', pipelines.data);
```

### Create Opportunity
```javascript
const opportunity = await client.request('create_opportunity', {
  contactId: 'contact_123',
  name: 'Premium Package - Jane Smith',
  pipelineId: 'pipeline_456',
  pipelineStageId: 'stage_789',
  monetaryValue: 50000,
  probability: 0.75,
  estimatedCloseDate: '2024-02-15',
  assignedTo: 'user_456',
  customFields: {
    deal_type: 'new_business',
    competitor: 'Competitor X',
    decision_criteria: 'Price, Features, Support'
  }
});
```

### Update Opportunity Stage
```javascript
// Move to next stage
await client.request('update_opportunity', {
  opportunityId: 'opp_123',
  pipelineStageId: 'stage_890',
  notes: 'Proposal accepted, moving to contract negotiation'
});

// Mark as won
await client.request('update_opportunity_status', {
  opportunityId: 'opp_123',
  status: 'won'
});
```

### Search Opportunities
```javascript
// Get all open opportunities
const openDeals = await client.request('search_opportunities', {
  status: 'open',
  assignedTo: 'user_456'
});

// Get high-value opportunities
const highValue = await client.request('search_opportunities', {
  minMonetaryValue: 25000,
  pipelineId: 'pipeline_456'
});
```

## Invoices & Payments

### Create Invoice
```javascript
const invoice = await client.request('create_invoice', {
  contactId: 'contact_123',
  name: 'Invoice #2024-001',
  title: 'Premium Package - Q1 2024',
  dueDate: '2024-02-01',
  currency: 'USD',
  items: [
    {
      name: 'Premium Package - Monthly',
      description: 'All-inclusive premium features',
      price: 4999.00,
      quantity: 3,
      unit: 'month'
    },
    {
      name: 'Onboarding & Setup',
      description: 'One-time setup and training',
      price: 2500.00,
      quantity: 1
    }
  ],
  discount: {
    type: 'percentage',
    value: 10,
    description: 'New customer discount'
  },
  terms: 'Net 30',
  notes: 'Thank you for your business!'
});
```

### Send Invoice
```javascript
await client.request('send_invoice', {
  invoiceId: 'inv_123',
  emailOptions: {
    subject: 'Invoice from Your Company',
    message: 'Please find attached your invoice for this month. Let us know if you have any questions!',
    cc: ['accounting@example.com']
  }
});
```

### Record Payment
```javascript
await client.request('record_invoice_payment', {
  invoiceId: 'inv_123',
  amount: 15000.00,
  paymentDate: '2024-01-25',
  paymentMethod: 'bank_transfer',
  transactionId: 'TXN-123456',
  notes: 'Received via ACH'
});
```

## Custom Fields

### Get Location Custom Fields
```javascript
const customFields = await client.request('get_location_custom_fields');
console.log('Available custom fields:', customFields.data);
```

### Create Custom Field
```javascript
const field = await client.request('create_location_custom_field', {
  name: 'Lead Temperature',
  fieldKey: 'lead_temperature',
  dataType: 'DROPDOWN',
  position: 0,
  acceptableValues: [
    'Hot 🔥',
    'Warm 🌡️', 
    'Cold ❄️'
  ],
  isRequired: false,
  isMultiple: false
});
```

### Update Contact Custom Fields
```javascript
await client.request('update_contact_custom_fields', {
  contactId: 'contact_123',
  customFields: {
    lead_temperature: 'Hot 🔥',
    last_campaign: 'Q1-2024-Webinar',
    lifetime_value: 75000
  }
});
```

## Advanced Workflows

### Complete Sales Flow Example
```javascript
async function completeSalesFlow(leadData) {
  try {
    // 1. Create contact
    const contact = await client.request('create_contact', {
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      source: 'Website',
      tags: ['new-lead', 'website']
    });
    
    // 2. Send welcome email
    await client.request('send_email', {
      contactId: contact.data.id,
      subject: 'Welcome! Here\'s what happens next...',
      html: getWelcomeEmailTemplate(leadData.firstName)
    });
    
    // 3. Create opportunity
    const opportunity = await client.request('create_opportunity', {
      contactId: contact.data.id,
      name: `New Lead - ${leadData.firstName} ${leadData.lastName}`,
      pipelineId: 'pipeline_leads',
      pipelineStageId: 'stage_new',
      monetaryValue: leadData.estimatedValue || 0
    });
    
    // 4. Schedule follow-up task
    await client.request('create_contact_task', {
      contactId: contact.data.id,
      title: 'Initial follow-up call',
      body: 'Call new lead to qualify and schedule demo',
      dueDate: getNextBusinessDay(),
      assignedTo: getNextAvailableSalesRep()
    });
    
    // 5. Add to nurture workflow
    await client.request('add_contact_to_workflow', {
      contactId: contact.data.id,
      workflowId: 'workflow_nurture_sequence'
    });
    
    return {
      success: true,
      contactId: contact.data.id,
      opportunityId: opportunity.data.id
    };
    
  } catch (error) {
    console.error('Sales flow error:', error);
    throw error;
  }
}
```

### Bulk Operations Example
```javascript
async function bulkImportContacts(csvData) {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (const row of csvData) {
    try {
      // Check for existing contact
      const existing = await client.request('search_contacts', {
        email: row.email
      });
      
      if (existing.data.contacts.length > 0) {
        // Update existing
        await client.request('update_contact', {
          contactId: existing.data.contacts[0].id,
          ...row
        });
      } else {
        // Create new
        await client.request('create_contact', row);
      }
      
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        row: row.email,
        error: error.message
      });
    }
  }
  
  return results;
}
```

### Conversation Analysis
```javascript
async function analyzeCustomerSentiment(contactId) {
  // Get recent conversations
  const conversations = await client.request('search_conversations', {
    contactId: contactId,
    limit: 10
  });
  
  // Get conversation messages and analyze
  const sentiments = [];
  
  for (const conv of conversations.data.conversations) {
    const messages = await client.request('get_conversation', {
      conversationId: conv.id
    });
    
    // Analyze sentiment (integrate with your ML service)
    const sentiment = await analyzeSentiment(messages.data);
    sentiments.push(sentiment);
  }
  
  // Update contact with sentiment score
  await client.request('update_contact_custom_fields', {
    contactId: contactId,
    customFields: {
      sentiment_score: calculateAverageSentiment(sentiments),
      last_sentiment_analysis: new Date().toISOString()
    }
  });
}
```

## Error Handling

Always implement proper error handling:

```javascript
try {
  const result = await client.request('create_contact', data);
  console.log('Success:', result);
} catch (error) {
  if (error.response?.status === 429) {
    console.error('Rate limited. Retry after:', error.response.headers['retry-after']);
  } else if (error.response?.status === 401) {
    console.error('Authentication failed. Check your API key.');
  } else {
    console.error('API Error:', error.message);
  }
}
```

## Best Practices

1. **Batch Operations**: Use bulk endpoints when available
2. **Rate Limiting**: Implement exponential backoff for retries
3. **Error Handling**: Always catch and handle errors appropriately
4. **Logging**: Log all API interactions for debugging
5. **Security**: Never expose API keys in client-side code
6. **Validation**: Validate data before sending to API
7. **Pagination**: Use pagination for large result sets
8. **Caching**: Cache frequently accessed data when appropriate

## Need More Examples?

Check out our other documentation:
- [API Reference](./API_REFERENCE.md) - Complete endpoint documentation
- [Setup Guide](./SETUP_GUIDE.md) - Platform setup instructions
- [GitHub Repository](https://github.com/Laithnsour11/dealflow-mcp-rl-platform) - Source code and more examples