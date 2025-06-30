/**
 * Fix for createTenantGHLClient to include all methods
 */

import { Tenant } from '@/types';
import { TenantGHLClientV2 } from './tenant-client-v2';
import { locationMethods } from './location-methods';
import { conversationMethods } from './conversation-methods';

// Extend the client with missing methods
export function createTenantGHLClientFixed(tenant: Tenant, decryptedApiKey: string): any {
  const client = new TenantGHLClientV2({
    apiKey: decryptedApiKey,
    locationId: tenant.ghl_location_id || '',
    baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com'
  });

  // Add location methods
  Object.assign(client, locationMethods);
  
  // Add conversation methods with fixed endpoints
  Object.assign(client, conversationMethods);

  // Add pipeline methods (for testing)
  (client as any).getPipelines = async function() {
    return this.makeRequest(`/opportunities/pipelines?locationId=${this.locationId}`);
  };

  // Add calendar methods (for testing)
  (client as any).getCalendars = async function() {
    return this.makeRequest(`/calendars/?locationId=${this.locationId}`);
  };

  // Override searchContacts to use correct endpoint
  (client as any).searchContacts = async function(params?: any) {
    const queryString 