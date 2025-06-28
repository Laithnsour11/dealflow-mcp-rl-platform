/**
 * Check database contents
 */

import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

// Load production env
dotenv.config({ path: '.env.production' })

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set')
    return
  }

  console.log('Connecting to database...')
  const sql = neon(databaseUrl)

  try {
    // Check if tenants table exists
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    console.log('Tables in database:', tablesResult.map(r => r.table_name))

    // Check tenants table structure
    const columnsResult = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position
    `
    console.log('\nTenants table columns:')
    columnsResult.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`)
    })

    // Check if any tenants exist
    const tenantsResult = await sql`
      SELECT tenant_id, subdomain, api_key_hash, status, oauth_installation_id, created_at
      FROM tenants
      ORDER BY created_at DESC
      LIMIT 10
    `
    console.log('\nRecent tenants:')
    if (tenantsResult.length === 0) {
      console.log('  No tenants found')
    } else {
      tenantsResult.forEach(tenant => {
        console.log(`  - ${tenant.tenant_id} (${tenant.subdomain})`)
        console.log(`    API key hash: ${tenant.api_key_hash?.substring(0, 16)}...`)
        console.log(`    Status: ${tenant.status}`)
        console.log(`    OAuth: ${tenant.oauth_installation_id ? 'Yes' : 'No'}`)
        console.log(`    Created: ${tenant.created_at}`)
      })
    }

    // Check OAuth installations
    const oauthResult = await sql`
      SELECT id, tenant_id, location_id, created_at
      FROM oauth_installations
      ORDER BY created_at DESC
      LIMIT 10
    `
    console.log('\nRecent OAuth installations:')
    if (oauthResult.length === 0) {
      console.log('  No OAuth installations found')
    } else {
      oauthResult.forEach(install => {
        console.log(`  - ${install.id} for tenant ${install.tenant_id}`)
        console.log(`    Location: ${install.location_id}`)
        console.log(`    Created: ${install.created_at}`)
      })
    }

  } catch (error) {
    console.error('Database error:', error)
  }
}

checkDatabase().catch(console.error)