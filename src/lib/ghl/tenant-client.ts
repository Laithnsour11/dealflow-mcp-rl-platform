import { Tenant } from '@/types';

interface GHLClientConfig {
  apiKey: string;
  locationId: string;
  baseUrl?: string;
}

class TenantGHLClient {
  private apiKey: string;
  private locationId: string;
  private baseUrl: string;

  constructor(config: GHLClientConfig) {
    this.apiKey = config.apiKey;
    this.locationId = config.locationId;
    this.baseUrl = config.baseUrl || 'https://services.leadconnectorhq.com';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Contact methods
  async getContacts(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/${queryString}`);
  }

  async getContactById(contactId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}`);
  }

  async createContact(data: any) {
    return this.makeRequest('/contacts/v1/', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateContact(contactId: string, data: any) {
    return this.makeRequest(`/contacts/v1/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(contactId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}`, {
      method: 'DELETE',
    });
  }

  async searchContacts(query: string) {
    return this.makeRequest(`/contacts/v1/search?query=${encodeURIComponent(query)}&locationId=${this.locationId}`);
  }

  async addContactTags(contactId: string, tags: string[]) {
    return this.makeRequest(`/contacts/v1/${contactId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  async removeContactTags(contactId: string, tags: string[]) {
    return this.makeRequest(`/contacts/v1/${contactId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tags }),
    });
  }

  // Conversation methods
  async getConversations(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/conversations/v1/${queryString}`);
  }

  async getConversationById(conversationId: string) {
    return this.makeRequest(`/conversations/v1/${conversationId}`);
  }

  async sendMessage(conversationId: string, message: string) {
    return this.makeRequest(`/conversations/v1/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Opportunity methods
  async getOpportunities(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/opportunities/v1/${queryString}`);
  }

  async getOpportunityById(opportunityId: string) {
    return this.makeRequest(`/opportunities/v1/${opportunityId}`);
  }

  async createOpportunity(data: any) {
    return this.makeRequest('/opportunities/v1/', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateOpportunity(opportunityId: string, data: any) {
    return this.makeRequest(`/opportunities/v1/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOpportunity(opportunityId: string) {
    return this.makeRequest(`/opportunities/v1/${opportunityId}`, {
      method: 'DELETE',
    });
  }

  async moveOpportunityStage(opportunityId: string, stageId: string) {
    return this.makeRequest(`/opportunities/v1/${opportunityId}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stageId }),
    });
  }

  // Pipeline methods
  async getPipelines() {
    return this.makeRequest(`/opportunities/v1/pipelines?locationId=${this.locationId}`);
  }

  async getStages(pipelineId: string) {
    return this.makeRequest(`/opportunities/v1/pipelines/${pipelineId}/stages`);
  }

  // Calendar methods
  async getCalendars() {
    return this.makeRequest(`/calendars/v1/?locationId=${this.locationId}`);
  }

  async getAppointments(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/calendars/v1/appointments${queryString}`);
  }

  async createAppointment(data: any) {
    return this.makeRequest('/calendars/v1/appointments', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateAppointment(appointmentId: string, data: any) {
    return this.makeRequest(`/calendars/v1/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(appointmentId: string) {
    return this.makeRequest(`/calendars/v1/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  }

  // Task methods
  async getTasks(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/tasks/v1/${queryString}`);
  }

  async createTask(data: any) {
    return this.makeRequest('/tasks/v1/', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateTask(taskId: string, data: any) {
    return this.makeRequest(`/tasks/v1/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId: string) {
    return this.makeRequest(`/tasks/v1/${taskId}`, {
      method: 'DELETE',
    });
  }

  async completeTask(taskId: string) {
    return this.makeRequest(`/tasks/v1/${taskId}/complete`, {
      method: 'PUT',
    });
  }

  // Note methods
  async getNotes(contactId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/notes`);
  }

  async createNote(contactId: string, body: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  }

  async updateNote(contactId: string, noteId: string, body: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ body }),
    });
  }

  async deleteNote(contactId: string, noteId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Workflow methods
  async triggerWorkflow(workflowId: string, contactId: string) {
    return this.makeRequest(`/workflows/v1/${workflowId}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ contactId }),
    });
  }

  // Form methods
  async getForms() {
    return this.makeRequest(`/forms/v1/?locationId=${this.locationId}`);
  }

  async getFormSubmissions(formId: string) {
    return this.makeRequest(`/forms/v1/${formId}/submissions`);
  }

  // Survey methods
  async getSurveys() {
    return this.makeRequest(`/surveys/v1/?locationId=${this.locationId}`);
  }

  async getSurveySubmissions(surveyId: string) {
    return this.makeRequest(`/surveys/v1/${surveyId}/submissions`);
  }

  // Campaign methods
  async getCampaigns() {
    return this.makeRequest(`/campaigns/v1/?locationId=${this.locationId}`);
  }

  async addContactToCampaign(campaignId: string, contactId: string) {
    return this.makeRequest(`/campaigns/v1/${campaignId}/contacts`, {
      method: 'POST',
      body: JSON.stringify({ contactId }),
    });
  }

  async removeContactFromCampaign(campaignId: string, contactId: string) {
    return this.makeRequest(`/campaigns/v1/${campaignId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Custom field and value methods
  async getCustomFields() {
    return this.makeRequest(`/locations/v1/${this.locationId}/customFields`);
  }

  async getCustomValues(contactId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/custom-values`);
  }

  async updateCustomValues(contactId: string, customFields: any) {
    return this.makeRequest(`/contacts/v1/${contactId}/custom-values`, {
      method: 'PUT',
      body: JSON.stringify({ customFields }),
    });
  }

  // User methods
  async getUsers() {
    return this.makeRequest(`/users/v1/?locationId=${this.locationId}`);
  }

  async getUserById(userId: string) {
    return this.makeRequest(`/users/v1/${userId}`);
  }

  // Webhook methods
  async getWebhooks() {
    return this.makeRequest(`/webhooks/v1/?locationId=${this.locationId}`);
  }

  async createWebhook(url: string, events: string[]) {
    return this.makeRequest('/webhooks/v1/', {
      method: 'POST',
      body: JSON.stringify({ url, events, locationId: this.locationId }),
    });
  }

  async updateWebhook(webhookId: string, data: any) {
    return this.makeRequest(`/webhooks/v1/${webhookId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWebhook(webhookId: string) {
    return this.makeRequest(`/webhooks/v1/${webhookId}`, {
      method: 'DELETE',
    });
  }

  // Location methods
  async getLocation() {
    return this.makeRequest(`/locations/v1/${this.locationId}`);
  }

  async updateLocation(data: any) {
    return this.makeRequest(`/locations/v1/${this.locationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Analytics methods
  async getAnalytics(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/analytics/v1/${queryString}`);
  }

  async getReportingData(reportType: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/reporting/v1/${reportType}${queryString}`);
  }
}

export function createTenantGHLClient(tenant: Tenant, decryptedApiKey: string): TenantGHLClient {
  return new TenantGHLClient({
    apiKey: decryptedApiKey,
    locationId: tenant.ghl_location_id,
  });
}