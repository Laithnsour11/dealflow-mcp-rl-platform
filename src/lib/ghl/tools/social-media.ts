/**
 * Social Media Management Tools - 17 tools for multi-platform social posting
 */

export class SocialMediaTools {
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

  // Post Management (6 tools)
  async searchSocialPosts(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/social-media/posts?locationId=${this.locationId}${queryString}`);
  }

  async createSocialPost(data: any) {
    return this.makeRequest('/social-media/posts', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async getSocialPost(postId: string) {
    return this.makeRequest(`/social-media/posts/${postId}`);
  }

  async updateSocialPost(postId: string, data: any) {
    return this.makeRequest(`/social-media/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSocialPost(postId: string) {
    return this.makeRequest(`/social-media/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteSocialPosts(postIds: string[]) {
    return this.makeRequest('/social-media/posts/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ postIds }),
    });
  }

  // Account Management (3 tools)
  async getSocialAccounts(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/social-media/accounts?locationId=${this.locationId}${queryString}`);
  }

  async deleteSocialAccount(accountId: string) {
    return this.makeRequest(`/social-media/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  async startSocialOAuth(data: any) {
    return this.makeRequest('/social-media/oauth/start', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  // CSV Import (3 tools)
  async uploadSocialCSV(file: File, data?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }
    formData.append('locationId', this.locationId);

    return this.makeRequest('/social-media/csv/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Let fetch set the Content-Type with boundary for multipart/form-data
      },
    });
  }

  async getCSVUploadStatus(uploadId: string) {
    return this.makeRequest(`/social-media/csv/status/${uploadId}`);
  }

  async setCSVAccounts(uploadId: string, data: any) {
    return this.makeRequest(`/social-media/csv/${uploadId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Categories & Tags (3 tools)
  async getSocialCategories(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/social-media/categories?locationId=${this.locationId}${queryString}`);
  }

  async getSocialTags(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/social-media/tags?locationId=${this.locationId}${queryString}`);
  }

  async getSocialTagsByIds(tagIds: string[]) {
    const idsParam = tagIds.join(',');
    return this.makeRequest(`/social-media/tags/by-ids?ids=${idsParam}&locationId=${this.locationId}`);
  }

  // Review Management (2 tools)
  async reviewSocialPost(postId: string, data: any) {
    return this.makeRequest(`/social-media/posts/${postId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReviewStatus(postId: string, data: any) {
    return this.makeRequest(`/social-media/posts/${postId}/review-status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}