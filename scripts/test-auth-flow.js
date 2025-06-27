#!/usr/bin/env node

/**
 * Test script for authentication flow
 * Usage: node scripts/test-auth-flow.js <base-url>
 */

const baseUrl = process.argv[2] || 'http://localhost:3000'

console.log(`\n🔐 Testing Authentication Flow on ${baseUrl}\n`)

// Test 1: Public endpoints without auth
async function testPublicEndpoints() {
  console.log('1️⃣ Testing public endpoints (no auth required)...')
  
  const publicEndpoints = [
    { url: '/', method: 'GET', name: 'Home page' },
    { url: '/api/health', method: 'GET', name: 'Health check' },
    { url: '/api/tenant/register?subdomain=test', method: 'GET', name: 'Check subdomain' }
  ]
  
  for (const endpoint of publicEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log(`   ✅ ${endpoint.name}: ${response.status} ${response.statusText}`)
      
      if (endpoint.url === '/api/health') {
        const data = await response.json()
        console.log(`      Status: ${data.status}, Env: ${data.environment}`)
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`)
    }
  }
}

// Test 2: Protected endpoints without auth
async function testProtectedWithoutAuth() {
  console.log('\n2️⃣ Testing protected endpoints without auth (should fail)...')
  
  const protectedEndpoints = [
    { url: '/api/mcp/search_contacts', method: 'GET', name: 'MCP endpoint' },
    { url: '/api/rl/analyze', method: 'POST', name: 'RL endpoint' },
  ]
  
  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.status === 401) {
        console.log(`   ✅ ${endpoint.name}: Correctly returned 401 Unauthorized`)
        const data = await response.json()
        console.log(`      Error: ${data.error}`)
      } else {
        console.log(`   ❌ ${endpoint.name}: Expected 401 but got ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`)
    }
  }
}

// Test 3: Register a test tenant
async function testTenantRegistration() {
  console.log('\n3️⃣ Testing tenant registration...')
  
  const testTenant = {
    name: 'Test Company',
    email: 'test@example.com',
    subdomain: `test-${Date.now()}`,
    ghlApiKey: 'test-ghl-api-key-12345',
    ghlLocationId: 'test-location-123',
    plan: 'free'
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/tenant/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTenant)
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log(`   ✅ Tenant created successfully!`)
      console.log(`      Tenant ID: ${data.data.tenantId}`)
      console.log(`      API Key: ${data.data.apiKey}`)
      console.log(`      Plan: ${data.data.plan}`)
      console.log(`      Usage Limit: ${data.data.usageLimit}`)
      
      return data.data.apiKey
    } else {
      console.log(`   ❌ Registration failed: ${data.error || data.message}`)
      return null
    }
  } catch (error) {
    console.log(`   ❌ Registration error: ${error.message}`)
    return null
  }
}

// Test 4: Protected endpoints with auth
async function testProtectedWithAuth(apiKey) {
  if (!apiKey) {
    console.log('\n4️⃣ Skipping authenticated tests (no API key available)')
    return
  }
  
  console.log('\n4️⃣ Testing protected endpoints with auth...')
  
  const protectedEndpoints = [
    { url: '/api/mcp/search_contacts', method: 'GET', name: 'MCP search' },
    { url: '/api/health', method: 'GET', name: 'Health with auth' },
  ]
  
  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-API-Key': apiKey
        }
      })
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint.name}: ${response.status} - Authenticated successfully`)
      } else {
        console.log(`   ❌ ${endpoint.name}: ${response.status} ${response.statusText}`)
        const data = await response.json()
        console.log(`      Error: ${data.error || data.message}`)
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`)
    }
  }
}

// Test 5: CORS headers
async function testCORSHeaders() {
  console.log('\n5️⃣ Testing CORS headers...')
  
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'X-Tenant-API-Key'
      }
    })
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
    }
    
    console.log('   CORS Headers:')
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        console.log(`   ✅ ${key}: ${value}`)
      } else {
        console.log(`   ❌ ${key}: Not set`)
      }
    })
  } catch (error) {
    console.log(`   ❌ CORS test error: ${error.message}`)
  }
}

// Run all tests
async function runTests() {
  await testPublicEndpoints()
  await testProtectedWithoutAuth()
  const apiKey = await testTenantRegistration()
  await testProtectedWithAuth(apiKey)
  await testCORSHeaders()
  
  console.log('\n✨ Authentication flow test completed!\n')
}

runTests().catch(console.error)