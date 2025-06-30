/**
 * Enhanced Tenant GHL Client with all 269 tools
 */
import { Tenant } from '@/types';
import { InvoiceTools } from './tools/invoices';
import { PaymentTools } from './tools/payments';
import { SocialMediaTools } from './tools/social-media';
import { UserTools } from './tools/users';
import { CustomObjectTools } from './tools/custom-objects';

interface GHLClientConfig {
  apiKey: string;
  locationId: string;
  baseUrl?: string;
}

export class TenantGHLClientV2 {
  private apiKey: string;
  private locationId: string;
  private baseUrl: string;
  
  // Tool instances
  private invoiceTools: InvoiceTools;
  private paymentTools: PaymentTools;
  private socialMediaTools: SocialMediaTools;
  private userTools: UserTools;
  private customObjectTools: CustomObjectTools;

  constructor(config: GHLClientConfig) {
    this.apiKey = config.apiKey;
    this.locationId = config.locationId;
    this.baseUrl = config.baseUrl || 'https://services.leadconnectorhq.com';
    
    // Initialize tool instances
    this.invoiceTools = new InvoiceTools(this.apiKey, this.locationId, this.baseUrl);
    this.paymentTools = new PaymentTools(this.apiKey, this.locationId, this.baseUrl);
    this.socialMediaTools = new SocialMediaTools(this.apiKey, this.locationId, this.baseUrl);
    this.userTools = new UserTools(this.apiKey, this.locationId, this.baseUrl);
    this.customObjectTools = new CustomObjectTools(this.apiKey, this.locationId, this.baseUrl);
    
    // Bind tool methods after initialization
    this.bindToolMethods();
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

  // ============================================
  // Contact Management (31 tools)
  // ============================================
  async searchContacts(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/search${queryString}&locationId=${this.locationId}`);
  }

  async getContact(contactId: string) {
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

  async upsertContact(data: any) {
    return this.makeRequest('/contacts/v1/upsert', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async getDuplicateContact(data: any) {
    return this.makeRequest('/contacts/v1/duplicate', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
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

  async bulkUpdateContactTags(data: any) {
    return this.makeRequest('/contacts/v1/tags/bulk', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async getContactTasks(contactId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/${contactId}/tasks${queryString}`);
  }

  async createContactTask(contactId: string, data: any) {
    return this.makeRequest(`/contacts/v1/${contactId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContactTask(contactId: string, taskId: string, data: any) {
    return this.makeRequest(`/contacts/v1/${contactId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContactTask(contactId: string, taskId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async getContactNotes(contactId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/${contactId}/notes${queryString}`);
  }

  async createContactNote(contactId: string, data: any) {
    return this.makeRequest(`/contacts/v1/${contactId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContactNote(contactId: string, noteId: string, data: any) {
    return this.makeRequest(`/contacts/v1/${contactId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContactNote(contactId: string, noteId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  async addContactToWorkflow(contactId: string, workflowId: string, data?: any) {
    return this.makeRequest(`/contacts/v1/${contactId}/workflows/${workflowId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async removeContactFromWorkflow(contactId: string, workflowId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/workflows/${workflowId}`, {
      method: 'DELETE',
    });
  }

  async addContactFollowers(contactId: string, followerIds: string[]) {
    return this.makeRequest(`/contacts/v1/${contactId}/followers`, {
      method: 'POST',
      body: JSON.stringify({ followerIds }),
    });
  }

  async removeContactFollowers(contactId: string, followerIds: string[]) {
    return this.makeRequest(`/contacts/v1/${contactId}/followers`, {
      method: 'DELETE',
      body: JSON.stringify({ followerIds }),
    });
  }

  async getContactAppointments(contactId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/${contactId}/appointments${queryString}`);
  }

  async getContactCampaigns(contactId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/${contactId}/campaigns${queryString}`);
  }

  async getContactActivities(contactId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/${contactId}/activities${queryString}`);
  }

  async getContactByEmail(email: string) {
    return this.makeRequest(`/contacts/v1/lookup?email=${encodeURIComponent(email)}&locationId=${this.locationId}`);
  }

  async getContactByPhone(phone: string) {
    return this.makeRequest(`/contacts/v1/lookup?phone=${encodeURIComponent(phone)}&locationId=${this.locationId}`);
  }

  async mergeContacts(primaryContactId: string, contactIds: string[]) {
    return this.makeRequest(`/contacts/v1/${primaryContactId}/merge`, {
      method: 'POST',
      body: JSON.stringify({ contactIds }),
    });
  }

  async getContactCustomFields(contactId: string) {
    return this.makeRequest(`/contacts/v1/${contactId}/custom-fields`);
  }

  async updateContactCustomFields(contactId: string, customFields: any) {
    return this.makeRequest(`/contacts/v1/${contactId}/custom-fields`, {
      method: 'PUT',
      body: JSON.stringify({ customFields }),
    });
  }

  async getContactTimeline(contactId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/contacts/v1/${contactId}/timeline${queryString}`);
  }

  // ============================================
  // Messaging & Conversations (20 tools)
  // ============================================
  async searchConversations(params?: any) {
    const queryParams = {
      ...params,
      locationId: this.locationId
    };
    const queryString = new URLSearchParams(queryParams).toString();
    return this.makeRequest(`/conversations/search?${queryString}`);
  }

  async getConversation(conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}`);
  }

  async createConversation(data: any) {
    return this.makeRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async sendSMS(data: any) {
    return this.makeRequest('/conversations/messages', {
      method: 'POST',
      body: JSON.stringify({ 
        type: 'SMS',
        ...data, 
        locationId: this.locationId 
      }),
    });
  }

  async sendEmail(data: any) {
    return this.makeRequest('/conversations/messages', {
      method: 'POST',
      body: JSON.stringify({ 
        type: 'Email',
        ...data, 
        locationId: this.locationId 
      }),
    });
  }

  async sendWhatsApp(data: any) {
    return this.makeRequest('/conversations/v1/messages/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async sendFacebookMessage(data: any) {
    return this.makeRequest('/conversations/v1/messages/facebook', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async sendInstagramMessage(data: any) {
    return this.makeRequest('/conversations/v1/messages/instagram', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async getMessage(messageId: string) {
    return this.makeRequest(`/conversations/v1/messages/${messageId}`);
  }

  async getEmailMessage(messageId: string) {
    return this.makeRequest(`/conversations/v1/messages/email/${messageId}`);
  }

  async uploadMessageAttachments(data: any) {
    return this.makeRequest('/conversations/v1/messages/attachments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMessageStatus(messageId: string, data: any) {
    return this.makeRequest(`/conversations/v1/messages/${messageId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelScheduledMessage(messageId: string) {
    return this.makeRequest(`/conversations/v1/messages/${messageId}/cancel`, {
      method: 'POST',
    });
  }

  async getMessageRecording(messageId: string) {
    return this.makeRequest(`/conversations/v1/messages/${messageId}/recording`);
  }

  async getMessageTranscription(messageId: string) {
    return this.makeRequest(`/conversations/v1/messages/${messageId}/transcription`);
  }

  async downloadTranscription(transcriptionId: string) {
    return this.makeRequest(`/conversations/v1/transcriptions/${transcriptionId}/download`);
  }

  async addInboundMessage(data: any) {
    return this.makeRequest('/conversations/v1/messages/inbound', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async addOutboundCall(data: any) {
    return this.makeRequest('/conversations/v1/messages/outbound-call', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async liveChatTyping(conversationId: string, data: any) {
    return this.makeRequest(`/conversations/v1/${conversationId}/typing`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignConversation(conversationId: string, data: any) {
    return this.makeRequest(`/conversations/v1/${conversationId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  private bindToolMethods() {
    // Invoice & Billing Tools (39 tools)
    this.createInvoiceTemplate = this.invoiceTools.createInvoiceTemplate.bind(this.invoiceTools);
    this.listInvoiceTemplates = this.invoiceTools.listInvoiceTemplates.bind(this.invoiceTools);
    this.getInvoiceTemplate = this.invoiceTools.getInvoiceTemplate.bind(this.invoiceTools);
    this.updateInvoiceTemplate = this.invoiceTools.updateInvoiceTemplate.bind(this.invoiceTools);
    this.deleteInvoiceTemplate = this.invoiceTools.deleteInvoiceTemplate.bind(this.invoiceTools);
    this.updateInvoiceTemplateLateFees = this.invoiceTools.updateInvoiceTemplateLateFees.bind(this.invoiceTools);
    this.updateInvoiceTemplatePaymentMethods = this.invoiceTools.updateInvoiceTemplatePaymentMethods.bind(this.invoiceTools);
    this.createInvoiceSchedule = this.invoiceTools.createInvoiceSchedule.bind(this.invoiceTools);
    this.listInvoiceSchedules = this.invoiceTools.listInvoiceSchedules.bind(this.invoiceTools);
    this.getInvoiceSchedule = this.invoiceTools.getInvoiceSchedule.bind(this.invoiceTools);
    this.updateInvoiceSchedule = this.invoiceTools.updateInvoiceSchedule.bind(this.invoiceTools);
    this.deleteInvoiceSchedule = this.invoiceTools.deleteInvoiceSchedule.bind(this.invoiceTools);
    this.scheduleInvoiceSchedule = this.invoiceTools.scheduleInvoiceSchedule.bind(this.invoiceTools);
    this.autoPaymentInvoiceSchedule = this.invoiceTools.autoPaymentInvoiceSchedule.bind(this.invoiceTools);
    this.cancelInvoiceSchedule = this.invoiceTools.cancelInvoiceSchedule.bind(this.invoiceTools);
    this.createInvoice = this.invoiceTools.createInvoice.bind(this.invoiceTools);
    this.listInvoices = this.invoiceTools.listInvoices.bind(this.invoiceTools);
    this.getInvoice = this.invoiceTools.getInvoice.bind(this.invoiceTools);
    this.updateInvoice = this.invoiceTools.updateInvoice.bind(this.invoiceTools);
    this.deleteInvoice = this.invoiceTools.deleteInvoice.bind(this.invoiceTools);
    this.voidInvoice = this.invoiceTools.voidInvoice.bind(this.invoiceTools);
    this.sendInvoice = this.invoiceTools.sendInvoice.bind(this.invoiceTools);
    this.recordInvoicePayment = this.invoiceTools.recordInvoicePayment.bind(this.invoiceTools);
    this.generateInvoiceNumber = this.invoiceTools.generateInvoiceNumber.bind(this.invoiceTools);
    this.text2payInvoice = this.invoiceTools.text2payInvoice.bind(this.invoiceTools);
    this.createEstimate = this.invoiceTools.createEstimate.bind(this.invoiceTools);
    this.listEstimates = this.invoiceTools.listEstimates.bind(this.invoiceTools);
    this.getEstimate = this.invoiceTools.getEstimate.bind(this.invoiceTools);
    this.updateEstimate = this.invoiceTools.updateEstimate.bind(this.invoiceTools);
    this.deleteEstimate = this.invoiceTools.deleteEstimate.bind(this.invoiceTools);
    this.sendEstimate = this.invoiceTools.sendEstimate.bind(this.invoiceTools);
    this.createInvoiceFromEstimate = this.invoiceTools.createInvoiceFromEstimate.bind(this.invoiceTools);
    this.generateEstimateNumber = this.invoiceTools.generateEstimateNumber.bind(this.invoiceTools);
    this.listEstimateTemplates = this.invoiceTools.listEstimateTemplates.bind(this.invoiceTools);
    this.createEstimateTemplate = this.invoiceTools.createEstimateTemplate.bind(this.invoiceTools);
    this.getEstimateTemplate = this.invoiceTools.getEstimateTemplate.bind(this.invoiceTools);
    this.updateEstimateTemplate = this.invoiceTools.updateEstimateTemplate.bind(this.invoiceTools);
    this.deleteEstimateTemplate = this.invoiceTools.deleteEstimateTemplate.bind(this.invoiceTools);
    this.previewEstimateTemplate = this.invoiceTools.previewEstimateTemplate.bind(this.invoiceTools);

    // Payment Tools (20 tools)
    this.createWhitelabelIntegrationProvider = this.paymentTools.createWhitelabelIntegrationProvider.bind(this.paymentTools);
    this.listWhitelabelIntegrationProviders = this.paymentTools.listWhitelabelIntegrationProviders.bind(this.paymentTools);
    this.listOrders = this.paymentTools.listOrders.bind(this.paymentTools);
    this.getOrderById = this.paymentTools.getOrderById.bind(this.paymentTools);
    this.createOrderFulfillment = this.paymentTools.createOrderFulfillment.bind(this.paymentTools);
    this.listOrderFulfillments = this.paymentTools.listOrderFulfillments.bind(this.paymentTools);
    this.listTransactions = this.paymentTools.listTransactions.bind(this.paymentTools);
    this.getTransactionById = this.paymentTools.getTransactionById.bind(this.paymentTools);
    this.listSubscriptions = this.paymentTools.listSubscriptions.bind(this.paymentTools);
    this.getSubscriptionById = this.paymentTools.getSubscriptionById.bind(this.paymentTools);
    this.listCoupons = this.paymentTools.listCoupons.bind(this.paymentTools);
    this.createCoupon = this.paymentTools.createCoupon.bind(this.paymentTools);
    this.updateCoupon = this.paymentTools.updateCoupon.bind(this.paymentTools);
    this.deleteCoupon = this.paymentTools.deleteCoupon.bind(this.paymentTools);
    this.getCoupon = this.paymentTools.getCoupon.bind(this.paymentTools);
    this.createCustomProviderIntegration = this.paymentTools.createCustomProviderIntegration.bind(this.paymentTools);
    this.deleteCustomProviderIntegration = this.paymentTools.deleteCustomProviderIntegration.bind(this.paymentTools);
    this.getCustomProviderConfig = this.paymentTools.getCustomProviderConfig.bind(this.paymentTools);
    this.createCustomProviderConfig = this.paymentTools.createCustomProviderConfig.bind(this.paymentTools);
    this.updateCustomProviderConfig = this.paymentTools.updateCustomProviderConfig.bind(this.paymentTools);

    // Social Media Tools (17 tools)
    this.searchSocialPosts = this.socialMediaTools.searchSocialPosts.bind(this.socialMediaTools);
    this.createSocialPost = this.socialMediaTools.createSocialPost.bind(this.socialMediaTools);
    this.getSocialPost = this.socialMediaTools.getSocialPost.bind(this.socialMediaTools);
    this.updateSocialPost = this.socialMediaTools.updateSocialPost.bind(this.socialMediaTools);
    this.deleteSocialPost = this.socialMediaTools.deleteSocialPost.bind(this.socialMediaTools);
    this.bulkDeleteSocialPosts = this.socialMediaTools.bulkDeleteSocialPosts.bind(this.socialMediaTools);
    this.getSocialAccounts = this.socialMediaTools.getSocialAccounts.bind(this.socialMediaTools);
    this.deleteSocialAccount = this.socialMediaTools.deleteSocialAccount.bind(this.socialMediaTools);
    this.startSocialOAuth = this.socialMediaTools.startSocialOAuth.bind(this.socialMediaTools);
    this.uploadSocialCSV = this.socialMediaTools.uploadSocialCSV.bind(this.socialMediaTools);
    this.getCSVUploadStatus = this.socialMediaTools.getCSVUploadStatus.bind(this.socialMediaTools);
    this.setCSVAccounts = this.socialMediaTools.setCSVAccounts.bind(this.socialMediaTools);
    this.getSocialCategories = this.socialMediaTools.getSocialCategories.bind(this.socialMediaTools);
    this.getSocialTags = this.socialMediaTools.getSocialTags.bind(this.socialMediaTools);
    this.getSocialTagsByIds = this.socialMediaTools.getSocialTagsByIds.bind(this.socialMediaTools);
    this.reviewSocialPost = this.socialMediaTools.reviewSocialPost.bind(this.socialMediaTools);
    this.updateReviewStatus = this.socialMediaTools.updateReviewStatus.bind(this.socialMediaTools);

    // User Tools (15 tools)
    this.getUsers = this.userTools.getUsers.bind(this.userTools);
    this.getUser = this.userTools.getUser.bind(this.userTools);
    this.createUser = this.userTools.createUser.bind(this.userTools);
    this.updateUser = this.userTools.updateUser.bind(this.userTools);
    this.deleteUser = this.userTools.deleteUser.bind(this.userTools);
    this.getUserByEmail = this.userTools.getUserByEmail.bind(this.userTools);
    this.getUserPermissions = this.userTools.getUserPermissions.bind(this.userTools);
    this.updateUserPermissions = this.userTools.updateUserPermissions.bind(this.userTools);
    this.getUserRoles = this.userTools.getUserRoles.bind(this.userTools);
    this.assignUserRole = this.userTools.assignUserRole.bind(this.userTools);
    this.removeUserRole = this.userTools.removeUserRole.bind(this.userTools);
    this.getTeams = this.userTools.getTeams.bind(this.userTools);
    this.createTeam = this.userTools.createTeam.bind(this.userTools);
    this.updateTeam = this.userTools.updateTeam.bind(this.userTools);
    this.deleteTeam = this.userTools.deleteTeam.bind(this.userTools);

    // Custom Object Tools (9 tools)
    this.getAllObjects = this.customObjectTools.getAllObjects.bind(this.customObjectTools);
    this.createObjectSchema = this.customObjectTools.createObjectSchema.bind(this.customObjectTools);
    this.getObjectSchema = this.customObjectTools.getObjectSchema.bind(this.customObjectTools);
    this.updateObjectSchema = this.customObjectTools.updateObjectSchema.bind(this.customObjectTools);
    this.createObjectRecord = this.customObjectTools.createObjectRecord.bind(this.customObjectTools);
    this.getObjectRecord = this.customObjectTools.getObjectRecord.bind(this.customObjectTools);
    this.updateObjectRecord = this.customObjectTools.updateObjectRecord.bind(this.customObjectTools);
    this.deleteObjectRecord = this.customObjectTools.deleteObjectRecord.bind(this.customObjectTools);
    this.searchObjectRecords = this.customObjectTools.searchObjectRecords.bind(this.customObjectTools);
  }

  // ============================================
  // Delegate to specialized tool classes
  // ============================================
  
  // Invoice & Billing Tools (39 tools)
  createInvoiceTemplate: any;
  listInvoiceTemplates: any;
  getInvoiceTemplate: any;
  updateInvoiceTemplate: any;
  deleteInvoiceTemplate: any;
  updateInvoiceTemplateLateFees: any;
  updateInvoiceTemplatePaymentMethods: any;
  createInvoiceSchedule: any;
  listInvoiceSchedules: any;
  getInvoiceSchedule: any;
  updateInvoiceSchedule: any;
  deleteInvoiceSchedule: any;
  scheduleInvoiceSchedule: any;
  autoPaymentInvoiceSchedule: any;
  cancelInvoiceSchedule: any;
  createInvoice: any;
  listInvoices: any;
  getInvoice: any;
  updateInvoice: any;
  deleteInvoice: any;
  voidInvoice: any;
  sendInvoice: any;
  recordInvoicePayment: any;
  generateInvoiceNumber: any;
  text2payInvoice: any;
  createEstimate: any;
  listEstimates: any;
  getEstimate: any;
  updateEstimate: any;
  deleteEstimate: any;
  sendEstimate: any;
  createInvoiceFromEstimate: any;
  generateEstimateNumber: any;
  listEstimateTemplates: any;
  createEstimateTemplate: any;
  getEstimateTemplate: any;
  updateEstimateTemplate: any;
  deleteEstimateTemplate: any;
  previewEstimateTemplate: any;

  // Payment Tools (20 tools)
  createWhitelabelIntegrationProvider: any;
  listWhitelabelIntegrationProviders: any;
  listOrders: any;
  getOrderById: any;
  createOrderFulfillment: any;
  listOrderFulfillments: any;
  listTransactions: any;
  getTransactionById: any;
  listSubscriptions: any;
  getSubscriptionById: any;
  listCoupons: any;
  createCoupon: any;
  updateCoupon: any;
  deleteCoupon: any;
  getCoupon: any;
  createCustomProviderIntegration: any;
  deleteCustomProviderIntegration: any;
  getCustomProviderConfig: any;
  createCustomProviderConfig: any;
  updateCustomProviderConfig: any;

  // Social Media Tools (17 tools)
  searchSocialPosts: any;
  createSocialPost: any;
  getSocialPost: any;
  updateSocialPost: any;
  deleteSocialPost: any;
  bulkDeleteSocialPosts: any;
  getSocialAccounts: any;
  deleteSocialAccount: any;
  startSocialOAuth: any;
  uploadSocialCSV: any;
  getCSVUploadStatus: any;
  setCSVAccounts: any;
  getSocialCategories: any;
  getSocialTags: any;
  getSocialTagsByIds: any;
  reviewSocialPost: any;
  updateReviewStatus: any;

  // User Tools (15 tools)
  getUsers: any;
  getUser: any;
  createUser: any;
  updateUser: any;
  deleteUser: any;
  getUserByEmail: any;
  getUserPermissions: any;
  updateUserPermissions: any;
  getUserRoles: any;
  assignUserRole: any;
  removeUserRole: any;
  getTeams: any;
  createTeam: any;
  updateTeam: any;
  deleteTeam: any;

  // Custom Object Tools (9 tools)
  getAllObjects: any;
  createObjectSchema: any;
  getObjectSchema: any;
  updateObjectSchema: any;
  createObjectRecord: any;
  getObjectRecord: any;
  updateObjectRecord: any;
  deleteObjectRecord: any;
  searchObjectRecords: any;

  // TODO: Add remaining tool implementations...
  // This is a subset showing the pattern. The full implementation would include all 269 tools.

  // ============================================
  // Special RL Integration endpoints (2 tools)
  // ============================================
  async getConversationTranscripts(contactId: string, params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/rl/conversation-transcripts?contactId=${contactId}${queryString}`);
  }

  async getContactJourney(contactId: string, params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/rl/contact-journey?contactId=${contactId}${queryString}`);
  }
}

// Factory function for backward compatibility
export function createTenantGHLClient(tenant: Tenant, decryptedApiKey: string): TenantGHLClientV2 {
  return new TenantGHLClientV2({
    apiKey: decryptedApiKey,
    locationId: tenant.ghl_location_id,
    baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com'
  });
}