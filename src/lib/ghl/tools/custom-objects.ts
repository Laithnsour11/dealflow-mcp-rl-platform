/**
 * Custom Objects Tools - 9 tools for flexible data modeling
 */

export class CustomObjectTools {
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

  // Object Schema Management (4 tools)
  async getAllObjects(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/custom-objects/schemas?locationId=${this.locationId}${queryString}`);
  }

  async createObjectSchema(data: any) {
    return this.makeRequest('/custom-objects/schemas', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async getObjectSchema(schemaId: string) {
    return this.makeRequest(`/custom-objects/schemas/${schemaId}`);
  }

  async updateObjectSchema(schemaId: string, data: any) {
    return this.makeRequest(`/custom-objects/schemas/${schemaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Object Record Management (5 tools)
  async createObjectRecord(schemaId: string, data: any) {
    return this.makeRequest(`/custom-objects/schemas/${schemaId}/records`, {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async getObjectRecord(schemaId: string, recordId: string) {
    return this.makeRequest(`/custom-objects/schemas/${schemaId}/records/${recordId}`);
  }

  async updateObjectRecord(schemaId: string, recordId: string, data: any) {
    return this.makeRequest(`/custom-objects/schemas/${schemaId}/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteObjectRecord(schemaId: string, recordId: string) {
    return this.makeRequest(`/custom-objects/schemas/${schemaId}/records/${recordId}`, {
      method: 'DELETE',
    });
  }

  async searchObjectRecords(schemaId: string, params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/custom-objects/schemas/${schemaId}/records?locationId=${this.locationId}${queryString}`);
  }
}