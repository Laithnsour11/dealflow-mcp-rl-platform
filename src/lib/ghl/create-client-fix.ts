/**
 * Fix for createTenantGHLClient to include all methods
 */

import { Tenant } from '@/types';
import { TenantGHLClientV2 } from './tenant-client-v2';
import { locationMethods } from './location-methods';

// Extend the client with missing methods
export function createTenantGHLClientFixed(tenant: Tenant, decryptedApiKey: string): any {
  const client = new TenantGHLClientV2({
    apiKey: decryptedApiKey,
    locationId: tenant.ghl_location_id || tenant.location_id || '',
    baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com'
  });

  // Add location methods
  Object.assign(client, locationMethods);

  // Add pipeline methods (for testing)
  (client as any).getPipelines = async function() {
    return this.makeRequest(`/opportunities/v1/pipelines?locationId=${this.locationId}`);
  };

  // Add calendar methods (for testing)
  (client as any).getCalendars = async function() {
    return this.makeRequest(`/calendars/v1/?locationId=${this.locationId}`);
  };

  return client;
}