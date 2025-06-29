/**
 * Location Management methods for GHL Client
 */

export const locationMethods = {
  // Location Management (10 tools)
  async getLocation(this: any) {
    return this.makeRequest(`/locations/${this.locationId}`);
  },

  async updateLocation(this: any, data: any) {
    return this.makeRequest(`/locations/${this.locationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getLocationTags(this: any) {
    return this.makeRequest(`/locations/${this.locationId}/tags`);
  },

  async createLocationTag(this: any, data: any) {
    return this.makeRequest(`/locations/${this.locationId}/tags`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLocationTag(this: any, tagId: string, data: any) {
    return this.makeRequest(`/locations/${this.locationId}/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteLocationTag(this: any, tagId: string) {
    return this.makeRequest(`/locations/${this.locationId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  },

  async getLocationCustomFields(this: any) {
    return this.makeRequest(`/locations/${this.locationId}/customFields`);
  },

  async createLocationCustomField(this: any, data: any) {
    return this.makeRequest(`/locations/${this.locationId}/customFields`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getLocationCustomValues(this: any) {
    return this.makeRequest(`/locations/${this.locationId}/customValues`);
  },

  async getLocationTemplates(this: any) {
    return this.makeRequest(`/locations/${this.locationId}/templates`);
  }
};