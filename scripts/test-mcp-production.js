#!/usr/bin/env node

/**
 * Production MCP Testing Script
 * Tests all MCP endpoints for functionality, security, and tenant isolation
 */

const fs = require('fs')
const path = require('path')

// Configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  testTenant1: {
    name: 'Test Company 1',
    email: 'test1@example.com',
    subdomain: `test1-${Date.now()}`,
    ghlApiKey: process.env.TEST_GHL_API_KEY_1 || 'test-ghl-key-1',
    ghlLocationId: process.env.TEST_GHL_LOCATION_1 || 'test-location-1',
  },
  testTenant2: {
    name: 'Test Company 2',
    email: 'test2@example.com',
    subdomain: `test2-${Date.now()}`,
    ghlApiKey: process.env.TEST_GHL_API_KEY_2 || 'test-ghl-key-2',
    ghlLocationId: process.env.TEST_GHL_LOCATION_2 || 'test-location-2',
  }
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
}

// Helper functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = response.headers.get('content-type')?.includes('application/json') 
      ? await response.json() 
      : await response.text()
    
    return { response, data }
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`)
  }
}

function logTest(name, status, details = '') {
  const symbols = {
    pass: '✅',
    fail: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  console.log(`${symbols[status]} ${name}`)
  if (details) {
    console.log(`   ${details}`)
  }
  
  testResults.details.push({ name, status, details })
  if (status === 'pass') testResults.passed++
  else if (status === 'fail') testResults.failed++
  else if (status === 'warning') testResults.warnings++
}

// Test 1: Register test tenants
async function registerTestTenants() {
  console.log('\n🏢 Registering Test Tenants\n')
  
  const tenants = {}
  
  for (const [key, tenantData] of Object.entries({ tenant1: config.testTenant1, tenant2: config.testTenant2 })) {
    try {
      const { response, data } = await makeRequest(`${config.baseUrl}/api/tenant/register`, {
        method: 'POST',
        body: JSON.stringify({
          ...tenantData,
          plan: 'pro'
        })
      })
      
      if (response.ok && data.success) {
        tenants[key] = {
          id: data.data.tenantId,
          apiKey: data.data.apiKey,
          data: tenantData
        }
        logTest(`Register ${key}`, 'pass', `ID: ${data.data.tenantId}`)
      } else {
        logTest(`Register ${key}`, 'fail', data.error || 'Registration failed')
      }
    } catch (error) {
      logTest(`Register ${key}`, 'fail', error.message)
    }
  }
  
  return tenants
}

// Test 2: Test MCP endpoints
async function testMCPEndpoints(tenant) {
  console.log(`\n🔧 Testing MCP Endpoints for Tenant: ${tenant.data.name}\n`)
  
  const mcpTests = [
    // Contact Management
    {
      name: 'Search Contacts',
      endpoint: '/api/mcp/search_contacts',
      method: 'GET',
      params: { limit: 10 }
    },
    {
      name: 'Create Contact',
      endpoint: '/api/mcp/create_contact',
      method: 'POST',
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${Date.now()}@example.com`,
        phone: '+1234567890',
        tags: ['test', 'mcp-validation']
      }
    },
    {
      name: 'Get Contact by ID',
      endpoint: '/api/mcp/get_contact',
      method: 'GET',
      params: { contactId: 'test-contact-id' },
      expectError: true // Expected to fail with test ID
    },
    
    // Conversation Management
    {
      name: 'Get Conversations',
      endpoint: '/api/mcp/get_conversations',
      method: 'GET',
      params: { limit: 5 }
    },
    
    // Opportunity Management
    {
      name: 'Get Opportunities',
      endpoint: '/api/mcp/get_opportunities',
      method: 'GET',
      params: { limit: 5 }
    },
    {
      name: 'Get Pipelines',
      endpoint: '/api/mcp/get_pipelines',
      method: 'GET'
    },
    
    // Calendar Management
    {
      name: 'Get Calendars',
      endpoint: '/api/mcp/get_calendars',
      method: 'GET'
    },
    
    // Custom Fields
    {
      name: 'Get Custom Fields',
      endpoint: '/api/mcp/get_custom_fields',
      method: 'GET'
    },
    
    // Analytics
    {
      name: 'Get Analytics',
      endpoint: '/api/mcp/get_analytics',
      method: 'GET',
      params: { startDate: '2024-01-01', endDate: '2024-12-31' }
    },
    
    // Tool Discovery
    {
      name: 'List Available Tools',
      endpoint: '/api/mcp/discover',
      method: 'OPTIONS'
    }
  ]
  
  for (const test of mcpTests) {
    try {
      const url = new URL(`${config.baseUrl}${test.endpoint}`)
      if (test.params) {
        Object.entries(test.params).forEach(([key, value]) => {
          url.searchParams.append(key, value)
        })
      }
      
      const { response, data } = await makeRequest(url.toString(), {
        method: test.method,
        headers: {
          'X-Tenant-API-Key': tenant.apiKey
        },
        body: test.body ? JSON.stringify(test.body) : undefined
      })
      
      if (test.expectError) {
        if (!response.ok) {
          logTest(test.name, 'pass', 'Expected error received')
        } else {
          logTest(test.name, 'warning', 'Expected error but request succeeded')
        }
      } else {
        if (response.ok && data.success) {
          logTest(test.name, 'pass', `Response time: ${data.metadata?.responseTime || 'N/A'}`)
        } else {
          logTest(test.name, 'fail', data.error || 'Request failed')
        }
      }
    } catch (error) {
      logTest(test.name, 'fail', error.message)
    }
  }
}

// Test 3: Test tenant isolation
async function testTenantIsolation(tenant1, tenant2) {
  console.log('\n🔒 Testing Tenant Isolation\n')
  
  // Create a contact with tenant1
  let contactId = null
  try {
    const { response, data } = await makeRequest(`${config.baseUrl}/api/mcp/create_contact`, {
      method: 'POST',
      headers: {
        'X-Tenant-API-Key': tenant1.apiKey
      },
      body: JSON.stringify({
        firstName: 'Isolated',
        lastName: 'Contact',
        email: `isolated.${Date.now()}@example.com`,
        tags: ['tenant1-only']
      })
    })
    
    if (response.ok && data.success && data.data?.id) {
      contactId = data.data.id
      logTest('Create contact with Tenant 1', 'pass', `Contact ID: ${contactId}`)
    } else {
      logTest('Create contact with Tenant 1', 'fail', 'Failed to create contact')
      return
    }
  } catch (error) {
    logTest('Create contact with Tenant 1', 'fail', error.message)
    return
  }
  
  // Try to access the contact with tenant2 (should fail)
  try {
    const { response, data } = await makeRequest(`${config.baseUrl}/api/mcp/get_contact?contactId=${contactId}`, {
      method: 'GET',
      headers: {
        'X-Tenant-API-Key': tenant2.apiKey
      }
    })
    
    if (!response.ok || !data.success) {
      logTest('Tenant 2 cannot access Tenant 1 contact', 'pass', 'Proper isolation confirmed')
    } else {
      logTest('Tenant 2 cannot access Tenant 1 contact', 'fail', 'SECURITY ISSUE: Cross-tenant access detected!')
    }
  } catch (error) {
    logTest('Tenant 2 cannot access Tenant 1 contact', 'pass', 'Access denied as expected')
  }
  
  // Verify tenant1 can still access their own contact
  try {
    const { response, data } = await makeRequest(`${config.baseUrl}/api/mcp/get_contact?contactId=${contactId}`, {
      method: 'GET',
      headers: {
        'X-Tenant-API-Key': tenant1.apiKey
      }
    })
    
    if (response.ok && data.success) {
      logTest('Tenant 1 can access own contact', 'pass', 'Proper access confirmed')
    } else {
      logTest('Tenant 1 can access own contact', 'fail', 'Cannot access own data')
    }
  } catch (error) {
    logTest('Tenant 1 can access own contact', 'fail', error.message)
  }
}

// Test 4: Test rate limiting
async function testRateLimiting(tenant) {
  console.log('\n⏱️ Testing Rate Limiting\n')
  
  const requests = []
  const requestCount = 20 // Quick burst of requests
  
  console.log(`   Sending ${requestCount} rapid requests...`)
  
  for (let i = 0; i < requestCount; i++) {
    requests.push(
      makeRequest(`${config.baseUrl}/api/mcp/get_contacts?limit=1`, {
        method: 'GET',
        headers: {
          'X-Tenant-API-Key': tenant.apiKey
        }
      }).then(result => ({ ...result, index: i }))
    )
  }
  
  const results = await Promise.all(requests)
  const rateLimited = results.filter(r => r.response.status === 429)
  
  if (rateLimited.length > 0) {
    logTest('Rate limiting active', 'pass', `${rateLimited.length} requests rate limited`)
  } else {
    logTest('Rate limiting active', 'warning', 'No rate limiting detected in burst test')
  }
}

// Test 5: Test error handling
async function testErrorHandling(tenant) {
  console.log('\n🚨 Testing Error Handling\n')
  
  const errorTests = [
    {
      name: 'Invalid tool name',
      endpoint: '/api/mcp/invalid_tool_name',
      expectedStatus: 404
    },
    {
      name: 'Missing required parameters',
      endpoint: '/api/mcp/get_contact',
      method: 'GET',
      expectedStatus: 400
    },
    {
      name: 'Invalid JSON body',
      endpoint: '/api/mcp/create_contact',
      method: 'POST',
      rawBody: 'invalid json {',
      expectedStatus: 400
    },
    {
      name: 'No authentication',
      endpoint: '/api/mcp/get_contacts',
      skipAuth: true,
      expectedStatus: 401
    }
  ]
  
  for (const test of errorTests) {
    try {
      const headers = test.skipAuth ? {} : { 'X-Tenant-API-Key': tenant.apiKey }
      
      const response = await fetch(`${config.baseUrl}${test.endpoint}`, {
        method: test.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: test.rawBody
      })
      
      if (response.status === test.expectedStatus) {
        logTest(test.name, 'pass', `Correctly returned ${test.expectedStatus}`)
      } else {
        logTest(test.name, 'fail', `Expected ${test.expectedStatus}, got ${response.status}`)
      }
    } catch (error) {
      logTest(test.name, 'fail', error.message)
    }
  }
}

// Test 6: Performance testing
async function testPerformance(tenant) {
  console.log('\n⚡ Testing Performance\n')
  
  const performanceTests = [
    { name: 'Simple GET', endpoint: '/api/mcp/get_contacts?limit=1', threshold: 500 },
    { name: 'Complex query', endpoint: '/api/mcp/search_contacts?query=test&limit=50', threshold: 1000 },
    { name: 'Tool discovery', endpoint: '/api/mcp/discover', method: 'OPTIONS', threshold: 100 }
  ]
  
  for (const test of performanceTests) {
    try {
      const startTime = Date.now()
      
      const { response, data } = await makeRequest(`${config.baseUrl}${test.endpoint}`, {
        method: test.method || 'GET',
        headers: {
          'X-Tenant-API-Key': tenant.apiKey
        }
      })
      
      const duration = Date.now() - startTime
      
      if (response.ok && duration < test.threshold) {
        logTest(`${test.name} performance`, 'pass', `${duration}ms (threshold: ${test.threshold}ms)`)
      } else if (response.ok) {
        logTest(`${test.name} performance`, 'warning', `${duration}ms (exceeded ${test.threshold}ms threshold)`)
      } else {
        logTest(`${test.name} performance`, 'fail', 'Request failed')
      }
    } catch (error) {
      logTest(`${test.name} performance`, 'fail', error.message)
    }
  }
}

// Generate test report
function generateReport() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 MCP PRODUCTION TEST REPORT')
  console.log('='.repeat(60))
  
  console.log(`\nTest Results:`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`⚠️  Warnings: ${testResults.warnings}`)
  console.log(`📝 Total Tests: ${testResults.passed + testResults.failed + testResults.warnings}`)
  
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)
  console.log(`\n🎯 Success Rate: ${successRate}%`)
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults.details
      .filter(t => t.status === 'fail')
      .forEach(t => console.log(`   - ${t.name}: ${t.details}`))
  }
  
  if (testResults.warnings > 0) {
    console.log('\n⚠️  Warnings:')
    testResults.details
      .filter(t => t.status === 'warning')
      .forEach(t => console.log(`   - ${t.name}: ${t.details}`))
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, `mcp-test-report-${Date.now()}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2))
  console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  
  // Production readiness assessment
  console.log('\n🚀 Production Readiness Assessment:')
  if (testResults.failed === 0 && successRate >= 95) {
    console.log('✅ MCP system is PRODUCTION READY')
  } else if (testResults.failed <= 2 && successRate >= 90) {
    console.log('⚠️  MCP system is MOSTLY READY (minor issues to address)')
  } else {
    console.log('❌ MCP system is NOT READY for production')
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 MCP Production Testing Suite')
  console.log('================================')
  console.log(`Base URL: ${config.baseUrl}`)
  console.log(`Test started: ${new Date().toISOString()}\n`)
  
  try {
    // Check if server is running
    try {
      await makeRequest(`${config.baseUrl}/api/health`)
      console.log('✅ Server is running\n')
    } catch (error) {
      console.error('❌ Server is not accessible. Please start the server first.')
      process.exit(1)
    }
    
    // Run all tests
    const tenants = await registerTestTenants()
    
    if (Object.keys(tenants).length < 2) {
      console.error('❌ Failed to register test tenants. Cannot proceed with tests.')
      process.exit(1)
    }
    
    await testMCPEndpoints(tenants.tenant1)
    await testTenantIsolation(tenants.tenant1, tenants.tenant2)
    await testRateLimiting(tenants.tenant1)
    await testErrorHandling(tenants.tenant1)
    await testPerformance(tenants.tenant1)
    
    // Generate final report
    generateReport()
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
    process.exit(1)
  }
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runTests }