/**
 * Test authentication flow
 * Run with: node test-auth.js
 */

const baseUrl = process.env.APP_URL || 'https://dealflow-mcp-rl-platform.vercel.app';

async function runDiagnostics() {
  console.log('🔍 Running authentication diagnostics...\n');
  
  try {
    // 1. Check health
    console.log('1. Checking system health...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    console.log('   ✓ System status:', health.status);
    
    // 2. Check database health
    console.log('\n2. Checking database health...');
    const dbHealthRes = await fetch(`${baseUrl}/api/health/db`);
    const dbHealth = await dbHealthRes.json();
    console.log('   Database connected:', dbHealth.database?.connected ? '✓ Yes' : '✗ No');
    console.log('   Active tenants:', dbHealth.tenants?.active || 0);
    if (dbHealth.tenants?.recent?.length > 0) {
      console.log('   Recent tenants:');
      dbHealth.tenants.recent.forEach(t => {
        console.log(`     - ${t.subdomain} (${t.status}) - API Key: ${t.has_api_key}, OAuth: ${t.has_oauth}`);
      });
    }
    
    // 3. Run comprehensive diagnostics
    console.log('\n3. Running comprehensive diagnostics...');
    const diagRes = await fetch(`${baseUrl}/api/oauth-debug/diagnostics`);
    const diagnostics = await diagRes.json();
    
    console.log('   Environment:');
    console.log('     - NODE_ENV:', diagnostics.environment.NODE_ENV);
    console.log('     - Database configured:', diagnostics.environment.databaseConfigured ? '✓' : '✗');
    console.log('     - Encryption key configured:', diagnostics.environment.encryptionKeyConfigured ? '✓' : '✗');
    
    if (diagnostics.recommendations?.length > 0) {
      console.log('\n   ⚠️  Recommendations:');
      diagnostics.recommendations.forEach(rec => {
        console.log(`     - ${rec.issue}`);
        console.log(`       Action: ${rec.action}`);
      });
    }
    
    // 4. Test with a specific API key if provided
    const apiKey = process.env.TEST_API_KEY;
    if (apiKey) {
      console.log('\n4. Testing API key authentication...');
      const authRes = await fetch(`${baseUrl}/api/oauth-debug/diagnostics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });
      const authResult = await authRes.json();
      
      console.log('   API Key format valid:', authResult.apiKey?.validFormat ? '✓' : '✗');
      console.log('   Authentication success:', authResult.authentication?.success ? '✓' : '✗');
      console.log('   Found in database:', authResult.database?.found ? '✓' : '✗');
      
      if (authResult.database?.tenant) {
        console.log('   Tenant details:');
        console.log('     - ID:', authResult.database.tenant.tenant_id);
        console.log('     - Subdomain:', authResult.database.tenant.subdomain);
        console.log('     - Status:', authResult.database.tenant.status);
      }
    } else {
      console.log('\n4. No TEST_API_KEY provided. Set TEST_API_KEY environment variable to test a specific key.');
    }
    
    console.log('\n✅ Diagnostics complete!');
    
  } catch (error) {
    console.error('\n❌ Error running diagnostics:', error.message);
  }
}

// Test making an authenticated request
async function testAuthenticatedRequest(apiKey) {
  console.log('\n📡 Testing authenticated MCP request...');
  
  try {
    const response = await fetch(`${baseUrl}/api/mcp/available-tools`, {
      headers: {
        'X-Tenant-API-Key': apiKey
      }
    });
    
    console.log('   Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✓ Authentication successful!');
      console.log('   Available tools:', data.tools?.length || 0);
    } else {
      const error = await response.text();
      console.log('   ✗ Authentication failed:', error);
    }
  } catch (error) {
    console.error('   ✗ Request failed:', error.message);
  }
}

// Run the diagnostics
(async () => {
  await runDiagnostics();
  
  // If API key is provided, test authenticated request
  if (process.env.TEST_API_KEY) {
    await testAuthenticatedRequest(process.env.TEST_API_KEY);
  }
})();