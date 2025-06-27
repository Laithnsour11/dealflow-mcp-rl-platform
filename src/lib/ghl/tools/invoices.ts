/**
 * Invoices & Billing Tools - 39 tools for comprehensive billing management
 */

export class InvoiceTools {
  private apiKey: string;
  private locationId: string;
  private baseUrl: string;

  constructor(apiKey: string, locationId: string, baseUrl = 'https://services.leadconnectorhq.com') {
    this.apiKey = apiKey;
    this.locationId = locationId;
    this.baseUrl = baseUrl;
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

  // Invoice Template Management (7 tools)
  async createInvoiceTemplate(data: any) {
    return this.makeRequest('/invoices/templates', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async listInvoiceTemplates(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/invoices/templates?locationId=${this.locationId}${queryString}`);
  }

  async getInvoiceTemplate(templateId: string) {
    return this.makeRequest(`/invoices/templates/${templateId}`);
  }

  async updateInvoiceTemplate(templateId: string, data: any) {
    return this.makeRequest(`/invoices/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoiceTemplate(templateId: string) {
    return this.makeRequest(`/invoices/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  async updateInvoiceTemplateLateFees(templateId: string, data: any) {
    return this.makeRequest(`/invoices/templates/${templateId}/late-fees`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateInvoiceTemplatePaymentMethods(templateId: string, data: any) {
    return this.makeRequest(`/invoices/templates/${templateId}/payment-methods`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Invoice Schedule Management (8 tools)
  async createInvoiceSchedule(data: any) {
    return this.makeRequest('/invoices/schedules', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async listInvoiceSchedules(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/invoices/schedules?locationId=${this.locationId}${queryString}`);
  }

  async getInvoiceSchedule(scheduleId: string) {
    return this.makeRequest(`/invoices/schedules/${scheduleId}`);
  }

  async updateInvoiceSchedule(scheduleId: string, data: any) {
    return this.makeRequest(`/invoices/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoiceSchedule(scheduleId: string) {
    return this.makeRequest(`/invoices/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  }

  async scheduleInvoiceSchedule(scheduleId: string, data: any) {
    return this.makeRequest(`/invoices/schedules/${scheduleId}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async autoPaymentInvoiceSchedule(scheduleId: string, data: any) {
    return this.makeRequest(`/invoices/schedules/${scheduleId}/auto-payment`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelInvoiceSchedule(scheduleId: string) {
    return this.makeRequest(`/invoices/schedules/${scheduleId}/cancel`, {
      method: 'POST',
    });
  }

  // Invoice Management (10 tools)
  async createInvoice(data: any) {
    return this.makeRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async listInvoices(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/invoices?locationId=${this.locationId}${queryString}`);
  }

  async getInvoice(invoiceId: string) {
    return this.makeRequest(`/invoices/${invoiceId}`);
  }

  async updateInvoice(invoiceId: string, data: any) {
    return this.makeRequest(`/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(invoiceId: string) {
    return this.makeRequest(`/invoices/${invoiceId}`, {
      method: 'DELETE',
    });
  }

  async voidInvoice(invoiceId: string, data?: any) {
    return this.makeRequest(`/invoices/${invoiceId}/void`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async sendInvoice(invoiceId: string, data: any) {
    return this.makeRequest(`/invoices/${invoiceId}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recordInvoicePayment(invoiceId: string, data: any) {
    return this.makeRequest(`/invoices/${invoiceId}/record-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateInvoiceNumber(data?: any) {
    return this.makeRequest('/invoices/generate-number', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async text2payInvoice(invoiceId: string, data: any) {
    return this.makeRequest(`/invoices/${invoiceId}/text2pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Estimate Management (8 tools)
  async createEstimate(data: any) {
    return this.makeRequest('/estimates', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async listEstimates(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/estimates?locationId=${this.locationId}${queryString}`);
  }

  async getEstimate(estimateId: string) {
    return this.makeRequest(`/estimates/${estimateId}`);
  }

  async updateEstimate(estimateId: string, data: any) {
    return this.makeRequest(`/estimates/${estimateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEstimate(estimateId: string) {
    return this.makeRequest(`/estimates/${estimateId}`, {
      method: 'DELETE',
    });
  }

  async sendEstimate(estimateId: string, data: any) {
    return this.makeRequest(`/estimates/${estimateId}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createInvoiceFromEstimate(estimateId: string, data?: any) {
    return this.makeRequest(`/estimates/${estimateId}/convert-to-invoice`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async generateEstimateNumber(data?: any) {
    return this.makeRequest('/estimates/generate-number', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  // Estimate Template Management (6 tools)
  async listEstimateTemplates(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/estimates/templates?locationId=${this.locationId}${queryString}`);
  }

  async createEstimateTemplate(data: any) {
    return this.makeRequest('/estimates/templates', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async getEstimateTemplate(templateId: string) {
    return this.makeRequest(`/estimates/templates/${templateId}`);
  }

  async updateEstimateTemplate(templateId: string, data: any) {
    return this.makeRequest(`/estimates/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEstimateTemplate(templateId: string) {
    return this.makeRequest(`/estimates/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  async previewEstimateTemplate(templateId: string, data?: any) {
    return this.makeRequest(`/estimates/templates/${templateId}/preview`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }
}