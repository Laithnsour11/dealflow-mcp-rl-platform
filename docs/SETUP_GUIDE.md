# GoHighLevel MCP Platform Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [OAuth Configuration](#oauth-configuration)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (we recommend Neon for serverless)
- GoHighLevel Marketplace App credentials
- Vercel account (for deployment)
- Git installed

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Laithnsour11/dealflow-mcp-rl-platform.git
cd dealflow-mcp-rl-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Copy Environment Variables

```bash
cp .env.example .env.local
```

## Environment Configuration

Edit `.env.local` with your credentials:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME="GoHighLevel MCP Platform"

# GoHighLevel OAuth
GHL_OAUTH_CLIENT_ID=your_client_id_here
GHL_OAUTH_CLIENT_SECRET=your_client_secret_here
GHL_BASE_URL=https://services.leadconnectorhq.com

# Database (Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEON_PROJECT_ID=your_neon_project_id

# Security Keys (generate secure random strings)
ENCRYPTION_KEY=base64_encoded_32_byte_key
API_KEY_SALT=random_salt_string
JWT_SECRET=random_jwt_secret
RL_ANONYMIZATION_SALT=random_rl_salt

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
OPENTELEMETRY_ENDPOINT=your_otel_endpoint
```

### Generating Security Keys

```bash
# Generate ENCRYPTION_KEY (32 bytes base64)
openssl rand -base64 32

# Generate other salts/secrets
openssl rand -hex 32
```

## Database Setup

### 1. Create Neon Project

1. Go to [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 2. Run Database Migrations

Create the following tables in your database:

```sql
-- Tenants table
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    auth_method VARCHAR(50) NOT NULL,
    oauth_installation_id UUID,
    location_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(50),
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- OAuth Installations table
CREATE TABLE oauth_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    location_id VARCHAR(255),
    company_id VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    scopes TEXT[],
    installed_at TIMESTAMP DEFAULT NOW(),
    last_refreshed_at TIMESTAMP,
    install_source VARCHAR(50),
    app_version VARCHAR(50)
);

-- Usage Records table (for analytics)
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    response_time INTEGER,
    status_code INTEGER,
    tokens_cost DECIMAL(10,6),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tenants_location ON tenants(location_id);
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_oauth_tenant ON oauth_installations(tenant_id);
CREATE INDEX idx_usage_tenant_date ON usage_records(tenant_id, created_at);
```

## OAuth Configuration

### 1. GoHighLevel Marketplace App Setup

1. Log in to your GoHighLevel Marketplace Developer account
2. Create a new app or edit existing
3. Configure OAuth settings:

```
Redirect URI: https://your-app.vercel.app/api/auth/platform/callback
Scopes: Select all required scopes (see list below)
```

### 2. Required OAuth Scopes

Select these scopes in your marketplace app:

**Contacts & CRM:**
- contacts.readonly
- contacts.write
- locations/customValues.readonly
- locations/customValues.write
- locations/customFields.readonly
- locations/customFields.write

**Conversations & Messaging:**
- conversations.readonly
- conversations.write
- conversations/message.readonly
- conversations/message.write

**Calendar & Appointments:**
- calendars.readonly
- calendars.write
- calendars/events.readonly
- calendars/events.write

**Opportunities & Pipelines:**
- opportunities.readonly
- opportunities.write

**Users & Permissions:**
- users.readonly
- users.write

**And all other scopes for full functionality...**

### 3. Webhook Configuration (Optional)

If using webhooks, configure:

```
Webhook URL: https://your-app.vercel.app/api/webhooks/ghl
Events: Select relevant events
```

## Deployment

### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2. Configure Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add all variables from `.env.local`
4. Ensure variables are available for Production environment

### 3. Configure Domain (Optional)

1. In Vercel project settings, go to Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` in environment variables

## Testing

### 1. Test OAuth Flow

```bash
# Start OAuth flow
curl https://your-app.vercel.app/api/auth/platform/start

# You'll be redirected to GoHighLevel to authorize
```

### 2. Test API Endpoints

```bash
# Test authentication
curl https://your-app.vercel.app/api/mcp/get_location \
  -H "X-Tenant-API-Key: YOUR_API_KEY"

# Test contact search
curl https://your-app.vercel.app/api/mcp/search_contacts \
  -H "X-Tenant-API-Key: YOUR_API_KEY"
```

### 3. Run Connection Tests

After OAuth setup, visit:
```
https://your-app.vercel.app/onboarding/success
```

Click "Run Test" to verify all endpoints.

## Troubleshooting

### Common Issues

#### 1. "invalid_state" Error During OAuth

**Cause**: Cookie settings or cross-site issues
**Solution**: 
- Ensure `sameSite: 'none'` and `secure: true` in cookie settings
- Check that `NEXT_PUBLIC_APP_URL` matches your actual deployment URL
- Clear browser cookies and try again

#### 2. 401 Unauthorized Errors

**Cause**: Expired OAuth token or invalid API key
**Solution**:
- Re-run OAuth flow to get fresh tokens
- Check API key format (should start with `ghl_mcp_`)
- Verify token refresh mechanism is working

#### 3. Database Connection Errors

**Cause**: Invalid connection string or network issues
**Solution**:
- Verify `DATABASE_URL` format
- Ensure SSL is enabled (`?sslmode=require`)
- Check Neon project is active

#### 4. Build Failures on Vercel

**Cause**: TypeScript errors or missing dependencies
**Solution**:
```bash
# Check locally first
npm run build

# Fix any TypeScript errors
npm run type-check

# Ensure all dependencies are in package.json
npm install --save [missing-package]
```

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
LOG_LEVEL=debug
```

This will provide detailed logs in:
- Browser console (client-side)
- Vercel Functions logs (server-side)

### Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Function Logs**: `vercel logs --prod`
3. **Database Monitoring**: Check Neon dashboard
4. **Error Tracking**: Configure Sentry (optional)

## Security Best Practices

1. **API Keys**:
   - Rotate regularly
   - Use secure generation methods
   - Never commit to version control

2. **Environment Variables**:
   - Use Vercel's encrypted environment variables
   - Different keys for development/production
   - Audit access regularly

3. **Database**:
   - Enable SSL/TLS
   - Use connection pooling
   - Regular backups

4. **OAuth Tokens**:
   - Encrypted at rest
   - Automatic refresh before expiry
   - Secure transmission only

## Maintenance

### Regular Tasks

1. **Monitor Usage**:
   ```sql
   SELECT 
     tenant_id,
     COUNT(*) as request_count,
     AVG(response_time) as avg_response_time
   FROM usage_records
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY tenant_id
   ORDER BY request_count DESC;
   ```

2. **Clean Up Expired Tokens**:
   ```sql
   DELETE FROM oauth_installations
   WHERE expires_at < NOW() - INTERVAL '30 days'
   AND last_refreshed_at < NOW() - INTERVAL '30 days';
   ```

3. **Update Dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

## Support

- **Documentation**: `/docs` directory
- **API Reference**: `/docs/API_REFERENCE.md`
- **Issues**: [GitHub Issues](https://github.com/Laithnsour11/dealflow-mcp-rl-platform/issues)
- **Logs**: `vercel logs --prod`

## Next Steps

1. Complete OAuth setup with your GoHighLevel account
2. Test all API endpoints using the connection tester
3. Integrate with your application using the API
4. Monitor usage and performance
5. Set up automated backups