/**
 * Internal API endpoint for creating/updating tenants
 */

import { NextRequest, NextResponse } from 'next/server';
import { neonDatabaseManager } from '@/lib/db/neon-database-manager';
import * as crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify internal API secret
    const internalSecret = request.headers.get('X-Internal-Secret');
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tenantId, authMethod, oauthInstallationId, subdomain } = await request.json();

    // Generate API key for the tenant
    const apiKey = `tk_${crypto.randomBytes(32).toString('hex')}`;
    const hashedApiKey = crypto
      .createHash('sha256')
      .update(apiKey + (process.env.API_KEY_SALT || ''))
      .digest('hex');

    // Create or update tenant in database
    const db = neonDatabaseManager.getDatabase();
    const sql = `
      INSERT INTO tenants (
        id,
        subdomain,
        api_key,
        auth_method,
        oauth_installation_id,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        auth_method = EXCLUDED.auth_method,
        oauth_installation_id = EXCLUDED.oauth_installation_id,
        updated_at = NOW()
      RETURNING id, subdomain, auth_method, created_at
    `;
    
    const params = [
      tenantId,
      subdomain,
      hashedApiKey,
      authMethod,
      oauthInstallationId
    ];
    
    const result = await db.executeSql(sql, params);

    return NextResponse.json({
      success: true,
      tenant: result.data?.rows?.[0] || { id: tenantId, subdomain, auth_method: authMethod },
      apiKey, // Return unhashed API key only on creation
    });
  } catch (error: any) {
    console.error('Failed to create/update tenant:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update tenant' },
      { status: 500 }
    );
  }
}