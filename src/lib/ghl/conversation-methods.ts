/**
 * Conversation-specific methods for GHL API
 * These methods handle all conversation and messaging operations
 */

export const conversationMethods = {
  async searchConversations(this: any, params?: any) {
    const queryParams = {
      locationId: this.locationId,
      ...params
    };
    const queryString = new URLSearchParams(queryParams).toString();
    return this.makeRequest(`/conversations/search?${queryString}`);
  },

  async getConversation(this: any, conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}`);
  },

  async getConversationMessages(this: any, conversationId: string, params?: any) {
    const queryParams = {
      ...params
    };
    const queryString = params ? `?${new URLSearchParams(queryParams).toString()}` : '';
    return this.makeRequest(`/conversations/${conversationId}/messages${queryString}`);
  },

  async createConversation(this: any, data: any) {
    return this.makeRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  },

  async sendMessage(this: any, data: any) {
    // Generic message sending endpoint
    return this.makeRequest('/conversations/messages', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  },

  async sendSMS(this: any, data: any) {
    return this.sendMessage.call(this, {
      type: 'SMS',
      ...data
    });
  },

  async sendEmail(this: any, data: any) {
    return this.sendMessage.call(this, {
      type: 'Email',
      ...data
    });
  },

  async sendWhatsApp(this: any, data: any) {
    return this.sendMessage.call(this, {
      type: 'WhatsApp',
      ...data
    });
  },

  async sendFacebookMessage(this: any, data: any) {
    return this.sendMessage.call(this, {
      type: 'FB',
      ...data
    });
  },

  async sendInstagramMessage(this: any, data: any) {
    return this.sendMessage.call(this, {
      type: 'IG',
      ...data
    });
  },

  async getMessage(this: any, messageId: string) {
    return this.makeRequest(`/conversations/messages/${messageId}`);
  },

  async updateMessage(this: any, messageId: string, data: any) {
    return this.makeRequest(`/conversations/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMessage(this: any, messageId: string) {
    return this.makeRequest(`/conversations/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  async getEmailMessage(this: any, messageId: string) {
    return this.makeRequest(`/conversations/messages/${messageId}/email`);
  },

  async uploadMessageAttachments(this: any, data: any) {
    return this.makeRequest('/conversations/messages/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMessageStatus(this: any, messageId: string, data: any) {
    return this.makeRequest(`/conversations/messages/${messageId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async cancelScheduledMessage(this: any, messageId: string) {
    return this.makeRequest(`/conversations/messages/${messageId}/schedule`, {
      method: 'DELETE',
    });
  },

  async getMessageRecording(this: any, messageId: string) {
    return this.makeRequest(`/conversations/messages/${messageId}/recording`);
  },

  async getMessageTranscription(this: any, messageId: string) {
    return this.makeRequest(`/conversations/messages/${messageId}/transcription`);
  },

  async downloadTranscription(this: any, transcriptionId: string) {
    return this.makeRequest(`/conversations/messages/transcriptions/${transcriptionId}/download`);
  },

  async addInboundMessage(this: any, data: any) {
    return this.makeRequest('/conversations/messages/inbound', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  },

  async addOutboundCall(this: any, data: any) {
    return this.makeRequest('/conversations/messages/outbound', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId, type: 'Call' }),
    });
  },

  async updateConversationStatus(this: any, conversationId: string, data: any) {
    return this.makeRequest(`/conversations/${conversationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteConversation(this: any, conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },

  async assignConversation(this: any, conversationId: string, data: any) {
    return this.makeRequest(`/conversations/${conversationId}/assign`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async unassignConversation(this: any, conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}/unassign`, {
      method: 'PUT',
    });
  },

  async liveChatTyping(this: any, conversationId: string, data: any) {
    return this.makeRequest(`/conversations/${conversationId}/typing`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};