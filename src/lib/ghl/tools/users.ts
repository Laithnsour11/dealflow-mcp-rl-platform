/**
 * User Management Tools - 15 tools for team and permission management
 */

export class UserTools {
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

  // User Management (6 tools)
  async getUsers(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/users?locationId=${this.locationId}${queryString}`);
  }

  async getUser(userId: string) {
    return this.makeRequest(`/users/${userId}`);
  }

  async createUser(data: any) {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateUser(userId: string, data: any) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getUserByEmail(email: string) {
    return this.makeRequest(`/users/search?email=${encodeURIComponent(email)}&locationId=${this.locationId}`);
  }

  // Permission Management (2 tools)
  async getUserPermissions(userId: string) {
    return this.makeRequest(`/users/${userId}/permissions`);
  }

  async updateUserPermissions(userId: string, data: any) {
    return this.makeRequest(`/users/${userId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Role Management (3 tools)
  async getUserRoles(userId: string) {
    return this.makeRequest(`/users/${userId}/roles`);
  }

  async assignUserRole(userId: string, data: any) {
    return this.makeRequest(`/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeUserRole(userId: string, roleId: string) {
    return this.makeRequest(`/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // Team Management (4 tools)
  async getTeams(params?: any) {
    const queryString = params ? `&${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/teams?locationId=${this.locationId}${queryString}`);
  }

  async createTeam(data: any) {
    return this.makeRequest('/teams', {
      method: 'POST',
      body: JSON.stringify({ ...data, locationId: this.locationId }),
    });
  }

  async updateTeam(teamId: string, data: any) {
    return this.makeRequest(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(teamId: string) {
    return this.makeRequest(`/teams/${teamId}`, {
      method: 'DELETE',
    });
  }
}