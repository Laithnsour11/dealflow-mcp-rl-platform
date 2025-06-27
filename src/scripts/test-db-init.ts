/**
 * Test script for database initialization
 * Run with: npx tsx src/scripts/test-db-init.ts
 */

import { dbOperations } from '../lib/db/neon-mcp-client'

async function testDatabaseInit() {
  console.log('🔧 Testing database initialization with schema constants...')
  
  try {
    // Test 1: Check database connection
    console.log('\n1. Testing database connection...')
    const healthCheck = await dbOperations.checkHealth()
    if (healthCheck.success) {
      console.log('✅ Database connection successful')
    } else {
      console.log('❌ Database connection failed:', healthCheck.error)
      return
    }

    // Test 2: Initialize schema
    console.log('\n2. Initializing database schema...')
    const schemaResult = await dbOperations.initializeDatabase()
    if (schemaResult.success) {
      console.log('✅ Database schema initialized successfully')
    } else {
      console.log('❌ Schema initialization failed:', schemaResult.error)
      return
    }

    // Test 3: Verify tables exist
    console.log('\n3. Verifying tables...')
    const tables = await dbOperations.getDatabaseTables()
    if (tables.success && tables.data) {
      console.log(`✅ Found ${tables.data.length} tables:`)
      tables.data.forEach((table: any) => {
        console.log(`   - ${table.table_name}`)
      })
    } else {
      console.log('❌ Failed to retrieve tables:', tables.error)
      return
    }

    // Test 4: Create a test tenant
    console.log('\n4. Creating test tenant...')
    const testTenant = {
      name: 'Test Tenant',
      subdomain: 'test-tenant',
      api_key: 'test-api-key-12345',
      ghl_api_key: 'test-ghl-key',
      ghl_location_id: 'test-location-123',
      subscription_tier: 'free' as const,
    }
    
    const createResult = await dbOperations.executeSql(
      `INSERT INTO tenants (name, subdomain, api_key_hash, encrypted_ghl_api_key, ghl_location_id, subscription_tier)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (subdomain) DO NOTHING
       RETURNING id`,
      [
        testTenant.name,
        testTenant.subdomain,
        'hashed-api-key', // In real usage, this would be hashed
        'encrypted-ghl-key', // In real usage, this would be encrypted
        testTenant.ghl_location_id,
        testTenant.subscription_tier
      ]
    )
    
    if (createResult.success) {
      console.log('✅ Test tenant created successfully')
    } else {
      console.log('⚠️  Test tenant might already exist or creation failed:', createResult.error)
    }

    // Test 5: Verify tenant exists
    console.log('\n5. Verifying tenant...')
    const tenantResult = await dbOperations.executeSql(
      'SELECT id, name, subdomain, subscription_tier FROM tenants WHERE subdomain = $1',
      ['test-tenant']
    )
    
    if (tenantResult.success && tenantResult.data?.rows?.length > 0) {
      console.log('✅ Tenant verified:', tenantResult.data.rows[0])
    } else {
      console.log('❌ Tenant verification failed')
    }

    console.log('\n✨ Database initialization test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
    process.exit(1)
  }
}

// Run the test
testDatabaseInit().catch(console.error)