/**
 * Payments Management Tools - 20 tools for comprehensive payment processing
 */

export class PaymentTools {
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

  // Integration Provider Management (2 tools)
  async createWhitelabelIntegrationProvider(data: any) {
    return this.makeRequest('/payments/integration-providers/whitelabel', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async listWhitelabelIntegrationProviders(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/payments/integration-providers/whitelabel?locationId=${this.locationId}${queryString}`);
  }

  // Order Management (4 tools)
  async listOrders(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/payments/orders?locationId=${this.locationId}${queryString}`);
  }

  async getOrderById(orderId: string) {
    return this.makeRequest(`/payments/orders/${orderId}`);
  }

  async createOrderFulfillment(orderId: string, data: any) {
    return this.makeRequest(`/payments/orders/${orderId}/fulfillments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listOrderFulfillments(orderId: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/payments/orders/${orderId}/fulfillments${queryString}`);
  }

  // Transaction Management (2 tools)
  async listTransactions(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/payments/transactions?locationId=${this.locationId}${queryString}`);
  }

  async getTransactionById(transactionId: string) {
    return this.makeRequest(`/payments/transactions/${transactionId}`);
  }

  // Subscription Management (2 tools)
  async listSubscriptions(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/payments/subscriptions?locationId=${this.locationId}${queryString}`);
  }

  async getSubscriptionById(subscriptionId: string) {
    return this.makeRequest(`/payments/subscriptions/${subscriptionId}`);
  }

  // Coupon Management (5 tools)
  async listCoupons(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/payments/coupons?locationId=${this.locationId}${queryString}`);
  }

  async createCoupon(data: any) {
    return this.makeRequest('/payments/coupons', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateCoupon(couponId: string, data: any) {
    return this.makeRequest(`/payments/coupons/${couponId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCoupon(couponId: string) {
    return this.makeRequest(`/payments/coupons/${couponId}`, {
      method: 'DELETE',
    });
  }

  async getCoupon(couponId: string) {
    return this.makeRequest(`/payments/coupons/${couponId}`);
  }

  // Custom Provider Integration (5 tools)
  async createCustomProviderIntegration(data: any) {
    return this.makeRequest('/payments/custom-provider/integration', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async deleteCustomProviderIntegration(integrationId: string) {
    return this.makeRequest(`/payments/custom-provider/integration/${integrationId}`, {
      method: 'DELETE',
    });
  }

  async getCustomProviderConfig(providerId: string) {
    return this.makeRequest(`/payments/custom-provider/${providerId}/config`);
  }

  async createCustomProviderConfig(providerId: string, data: any) {
    return this.makeRequest(`/payments/custom-provider/${providerId}/config`, {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateCustomProviderConfig(providerId: string, configId: string, data: any) {
    return this.makeRequest(`/payments/custom-provider/${providerId}/config/${configId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}