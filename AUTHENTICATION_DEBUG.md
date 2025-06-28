# Authentication Debugging Guide

## Overview
This guide helps you debug authentication issues in the GHL MCP + RL Platform.

## Quick Diagnosis Steps

### 1. Access the Test Dashboard
Open your browser and navigate to:
```
https://your-app-url.vercel.app/test-auth.html
```
or for local development:
```
http://localhost:3000/test-auth.html
```

### 2. Run System Diagnostics
1. Click "Check Health" - Verifies the application is running
2. Click "Check Database" - Verifies database connectivity and shows tenant count
3. Click "Run Full Diagnostics" - Comprehensive system check including:
   - Environment variables status
   - Database connectivity
   - Tenant statistics
   - API key generation test

### 3. Fix Schema Issues
If authentication is failing, the database schema might be missing required columns:

1. Click "Check Schema" to see current database structure
2. Click "Fix Schema" to apply necessary updates, which will:
   - Add `tenant_id` column (if missing)
   - Add `subdomain` column (if missing)
   - Add `oauth_installation_id` column (if missing)
   - Add `usage_limit` column (if missing)
   - Create necessary indexes

### 4. Create a Test Tenant
1. Enter a subdomain (e.g., "test-tenant")
2. Select a plan (default: "pro")
3. Click "Create Test Tenant"
4. The API key will be automatically populated in the authentication test section

### 5. Test Authentication
1. Copy the API key from the test tenant creation
2. Click "Test API Key" to verify the key is valid
3. Click "Test Authenticated Request" to make an actual API call

## Common Issues and Solutions

### Issue: "Invalid API key"
**Symptoms:**
- Authentication returns `{ success: false, error: "Invalid API key" }`
- API key format is correct but not found in database

**Solutions:**
1. Run "Fix Schema" to ensure database has correct columns
2. Check that API key starts with `ghl_mcp_`
3. Verify the tenant exists and is active in the database

### Issue: "Database not connected"
**Symptoms:**
- Health check shows database disconnected
- All API calls fail

**Solutions:**
1. Check `DATABASE_URL` environment variable is set correctly
2. Verify Neon database is accessible
3. Check network connectivity

### Issue: "No tenants found"
**Symptoms:**
- Database is connected but no tenants exist
- Authentication always fails

**Solutions:**
1. Create a test tenant using the dashboard
2. Complete OAuth flow to create a tenant
3. Use the admin API to manually create a tenant

## Manual Testing with cURL

### Test Health Endpoint
```bash
curl https://your-app-url.vercel.app/api/health
```

### Test Database Health
```bash
curl https://your-app-url.vercel.app/api/health/db
```

### Run Diagnostics
```bash
curl https://your-app-url.vercel.app/api/oauth-debug/diagnostics
```

### Test API Key
```bash
curl -X POST https://your-app-url.vercel.app/api/oauth-debug/diagnostics \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "ghl_mcp_your_api_key_here"}'
```

### Create Test Tenant
```bash
curl -X POST https://your-app-url.vercel.app/api/admin/test-tenant \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "test-tenant", "plan": "pro"}'
```

### Make Authenticated Request
```bash
curl https://your-app-url.vercel.app/api/mcp/available-tools \
  -H "X-Tenant-API-Key: ghl_mcp_your_api_key_here"
```

## Node.js Test Script

Run the provided test script:
```bash
# Basic diagnostics
node test-auth.js

# Test with specific API key
TEST_API_KEY=ghl_mcp_your_key_here node test-auth.js

# Test against production
APP_URL=https://your-app-url.vercel.app node test-auth.js
```

## Database Schema Reference

The `tenants` table should have these columns:
- `id` (UUID) - Primary key
- `tenant_id` (UUID) - Unique tenant identifier
- `subdomain` (VARCHAR) - Unique subdomain
- `api_key_hash` (VARCHAR) - Hashed API key for authentication
- `ghl_location_id` (VARCHAR) - GoHighLevel location ID
- `oauth_installation_id` (UUID) - OAuth installation reference
- `plan` (VARCHAR) - Subscription plan
- `status` (VARCHAR) - Tenant status (active, suspended, etc.)
- `usage_limit` (INTEGER) - API usage limit
- `current_usage` (INTEGER) - Current usage count

## Environment Variables

Required environment variables:
```env
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=your-32-char-encryption-key
API_KEY_SALT=your-api-key-salt
ADMIN_API_KEY=your-admin-key
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

## Still Having Issues?

1. Check Vercel logs for server-side errors
2. Inspect browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure database migrations have been applied
5. Check that the Neon database is accessible

## Support

For additional help:
- Check the main README.md
- Review the PLANNING.md document
- Contact the development team