/**
 * Internal API endpoint for storing OAuth installations
 */

import { NextRequest, NextResponse } from 'next/server';
import { neonDatabaseManager } from '@/lib/db/neon-database-manager';

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

    const installation = await request.json();

    // Store OAuth installation in database
    const db = neonDatabaseManager.getDatabase();
    const sql = `
      INSERT INTO oauth_installations (
        id,
        tenant_id,
        location_id,
        company_id,
        access_token,
        refresh_token,
        expires_at,
        scopes,
        installed_at,
        install_source,
        app_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        scopes = EXCLUDED.scopes,
        app_version = EXCLUDED.app_version
      RETURNING *
    `;
    
    const params = [
      installation.id,
      installation.tenant_id,
      installation.location_id,
      installation.company_id,
      installation.access_token,
      installation.refresh_token,
      installation.expires_at,
      installation.scopes,
      installation.installed_at,
      installation.install_source,
      installation.app_version
    ];
    
    const result = await db.executeSql(sql, params);

    return NextResponse.json({
      success: true,
      installation: result.data?.rows?.[0] || installation,
    });
  } catch (error: any) {
    console.error('Failed to store OAuth installation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store installation' },
      { status: 500 }
    );
  }
}