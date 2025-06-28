/**
 * Test script to verify OAuth flow creates tenant correctly
 */

import { tenantAuth } from '../src/lib/auth/tenant-auth'

async function testOAuthFlow() {
  console.log('Testing OAuth flow...\n')

  // 1. Test API key generation
  const apiKey = tenantAuth.generateApiKey()
  console.log('Generated API key:', apiKey)
  console.log('API key format valid:', apiKey.startsWith('ghl_mcp_'))

  // 2. Test API key hashing
  const hash = tenantAuth.hashApiKey(apiKey)
  console.log('API key hash:', hash.substring(0, 16) + '...')

  // 3. Test authentication (should fail without database)
  try {
    const auth = await tenantAuth.authenticateTenant(apiKey)
    console.log('Authentication result:', auth)
  } catch (error) {
    console.log('Authentication error (expected):', error)
  }

  // 4. Show what needs to be in database
  console.log('\nFor authentication to work, the database needs:')
  console.log('- Table: tenants')
  console.log('- Column: api_key_hash =', hash)
  console.log('- Column: status = "active"')
  console.log('- Column: tenant_id = <some-uuid>')
  console.log('- Column: oauth_installation_id = <installation-id>')
}

testOAuthFlow().catch(console.error)