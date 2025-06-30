-- GoHighLevel MCP Platform Database Schema
-- PostgreSQL/Neon Database Migrations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tenants table - Core multi-tenancy
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    auth_method VARCHAR(50) NOT NULL CHECK (auth_method IN ('oauth', 'api_key')),
    oauth_installation_id UUID,
    location_id VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for tenants
CREATE INDEX idx_tenants_location ON tenants(location_id);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_oauth ON tenants(oauth_installation_id);

-- ============================================
-- API Keys table - Tenant authentication
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(50) DEFAULT 'ghl_mcp_',
    name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by VARCHAR(255),
    permissions JSONB DEFAULT '[]'
);

-- Indexes for API keys
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at);

-- ============================================
-- OAuth Installations table
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    location_id VARCHAR(255) NOT NULL,
    company_id VARCHAR(255),
    user_id VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    scopes TEXT[],
    installed_at TIMESTAMP DEFAULT NOW(),
    last_refreshed_at TIMESTAMP,
    install_source VARCHAR(50) DEFAULT 'marketplace',
    app_version VARCHAR(50),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for OAuth installations
CREATE INDEX idx_oauth_tenant ON oauth_installations(tenant_id);
CREATE INDEX idx_oauth_location ON oauth_installations(location_id);
CREATE INDEX idx_oauth_expires ON oauth_installations(expires_at);

-- ============================================
-- Usage Records table - Analytics & Billing
-- ============================================
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time INTEGER,
    status_code INTEGER,
    tokens_cost DECIMAL(10,6) DEFAULT 0,
    request_size INTEGER,
    response_size INTEGER,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for usage records
CREATE INDEX idx_usage_tenant_date ON usage_records(tenant_id, created_at);
CREATE INDEX idx_usage_endpoint ON usage_records(endpoint);
CREATE INDEX idx_usage_status ON usage_records(status_code);
CREATE INDEX idx_usage_created ON usage_records(created_at);

-- Partitioning for usage_records by month (optional for large scale)
-- CREATE TABLE usage_records_2024_01 PARTITION OF usage_records
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- ============================================
-- Rate Limiting table
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    window_start TIMESTAMP NOT NULL,
    window_end TIMESTAMP NOT NULL,
    request_count INTEGER DEFAULT 0,
    limit_exceeded BOOLEAN DEFAULT false,
    UNIQUE(tenant_id, window_start)
);

-- Indexes for rate limits
CREATE INDEX idx_rate_limits_tenant ON rate_limits(tenant_id);
CREATE INDEX idx_rate_limits_window ON rate_limits(window_end);

-- ============================================
-- Webhook Events table (optional)
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    payload JSONB NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'pending',
    delivery_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for webhook events
CREATE INDEX idx_webhooks_tenant ON webhook_events(tenant_id);
CREATE INDEX idx_webhooks_status ON webhook_events(delivery_status);
CREATE INDEX idx_webhooks_created ON webhook_events(created_at);

-- ============================================
-- Audit Log table (optional)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to tenants
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Delete expired API keys
    DELETE FROM api_keys 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    -- Delete old usage records (keep 90 days)
    DELETE FROM usage_records 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete old rate limit windows
    DELETE FROM rate_limits 
    WHERE window_end < NOW() - INTERVAL '1 day';
    
    -- Delete old webhook events (keep 30 days)
    DELETE FROM webhook_events 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ language 'plpgsql';

-- ============================================
-- Initial Data / Permissions
-- ============================================

-- Create default permissions enum
CREATE TYPE permission_type AS ENUM (
    'contacts.read',
    'contacts.write',
    'conversations.read',
    'conversations.write',
    'opportunities.read',
    'opportunities.write',
    'calendars.read',
    'calendars.write',
    'invoices.read',
    'invoices.write',
    'admin.all'
);

-- ============================================
-- Views for easier querying
-- ============================================

-- Active tenants with stats
CREATE OR REPLACE VIEW tenant_stats AS
SELECT 
    t.tenant_id,
    t.subdomain,
    t.auth_method,
    t.created_at,
    COUNT(DISTINCT u.id) as total_requests_30d,
    AVG(u.response_time) as avg_response_time,
    SUM(u.tokens_cost) as total_cost_30d
FROM tenants t
LEFT JOIN usage_records u ON t.tenant_id = u.tenant_id 
    AND u.created_at > NOW() - INTERVAL '30 days'
GROUP BY t.tenant_id;

-- API key usage
CREATE OR REPLACE VIEW api_key_usage AS
SELECT 
    ak.id,
    ak.tenant_id,
    ak.name,
    ak.created_at,
    ak.last_used_at,
    COUNT(u.id) as request_count_24h
FROM api_keys ak
LEFT JOIN usage_records u ON ak.tenant_id = u.tenant_id 
    AND u.created_at > NOW() - INTERVAL '24 hours'
WHERE ak.is_active = true
GROUP BY ak.id;

-- ============================================
-- Indexes for performance
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_usage_tenant_endpoint_date ON usage_records(tenant_id, endpoint, created_at);
CREATE INDEX idx_oauth_tenant_location ON oauth_installations(tenant_id, location_id);

-- ============================================
-- Grants (adjust based on your database users)
-- ============================================

-- Example grants for application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================
-- Migration version tracking
-- ============================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');

-- ============================================
-- Notes
-- ============================================
-- 1. Run these migrations in order
-- 2. Backup your database before running migrations
-- 3. Test in development environment first
-- 4. Monitor performance after deployment
-- 5. Consider partitioning for usage_records at scale
-- 6. Add more indexes based on query patterns