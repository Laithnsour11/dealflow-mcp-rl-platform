/**
 * Patch for missing location methods in TenantGHLClientV2
 */

export function addLocationMethods(client: any) {
  // Location Management tools
  client.getLocation = async function() {
    return this.makeRequest(`/locations/v1/${this.locationId}`);
  };

  client.updateLocation = async function(data: any) {
    return this.makeRequest(`/locations/v1/${this.locationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  client.getLocationTags = async function() {
    return this.makeRequest(`/locations/v1/${this.locationId}/tags`);
  };

  client.createLocationTag = async function(data: any) {
    return this.makeRequest(`/locations/v1/${this.locationId}/tags`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  // Pipelines (for testing)
  client.getPipelines = async function() {
    return this.makeRequest(`/opportunities/v1/pipelines?locationId=${this.locationId}`);
  };

  // Calendars (for testing)
  client.getCalendars = async function() {
    return this.makeRequest(`/calendars/v1/?locationId=${this.locationId}`);
  };

  return client;
}