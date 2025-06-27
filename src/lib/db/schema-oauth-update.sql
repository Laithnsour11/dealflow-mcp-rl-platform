-- OAuth Installation Schema Update for GoHighLevel Marketplace
-- Adds support for OAuth 2.0 authentication and marketplace installations

-- OAuth installations table - Store OAuth tokens and installation data
CREATE TABLE IF NOT EXISTS oauth_installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id VARCHAR(255) NOT NULL,
    company_id VARCHAR(255), -- Optional, for agency-level access
    access_token_encrypted TEXT NOT NULL, -- Encrypted OAuth access token
    refresh_token_encrypted TEXT NOT NULL, -- Encrypted OAuth refresh token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[] NOT NULL, -- Array of granted OAuth scopes
    install_source VARCHAR(50) NOT NULL DEFAULT 'marketplace' CHECK (install_source IN ('marketplace', 'direct', 'api')),
    app_version VARCHAR(20) NOT NULL,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_refreshed_at TIMESTAMP WITH TIME ZONE,
    refresh_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT unique_tenant_location UNIQUE(tenant_id, location_id)
);

-- Create indexes for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_oauth_tenant_id ON oauth_installations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_oauth_location_id ON oauth_installations(location_id);
CREATE INDEX IF NOT EXISTS idx_oauth_expires_at ON oauth_installations(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_active ON oauth_installations(active);

-- OAuth state storage - For OAuth flow state management
CREATE TABLE IF NOT EXISTS oauth_states (
    state VARCHAR(255) PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('Location', 'Company')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
    used BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'
);

-- Create index for state cleanup
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at) WHERE used = false;

-- OAuth refresh log - Track token refreshes for debugging
CREATE TABLE IF NOT EXISTS oauth_refresh_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installation_id UUID NOT NULL REFERENCES oauth_installations(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of refresh token for tracking
    success BOOLEAN NOT NULL,
    error_message TEXT,
    new_expires_at TIMESTAMP WITH TIME ZONE,
    refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create index for refresh history
CREATE INDEX IF NOT EXISTS idx_refresh_log_installation ON oauth_refresh_log(installation_id, refreshed_at DESC);

-- Marketplace app installations - Track marketplace-specific data
CREATE TABLE IF NOT EXISTS marketplace_installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    oauth_installation_id UUID REFERENCES oauth_installations(id) ON DELETE SET NULL,
    marketplace_app_id VARCHAR(255), -- GHL marketplace app ID
    subscription_id VARCHAR(255), -- GHL subscription ID if applicable
    trial_started_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_status VARCHAR(50) CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired', 'pending')),
    features_enabled JSONB DEFAULT '{}', -- Feature flags for this installation
    billing_email VARCHAR(255),
    installed_from VARCHAR(50) CHECK (installed_from IN ('marketplace', 'direct_link', 'partner', 'referral')),
    referral_source VARCHAR(255),
    uninstalled_at TIMESTAMP WITH TIME ZONE,
    uninstall_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for marketplace analytics
CREATE INDEX IF NOT EXISTS idx_marketplace_tenant ON marketplace_installations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_installations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_trial ON marketplace_installations(trial_ends_at) WHERE subscription_status = 'trial';

-- Update tenants table to support multiple auth methods
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS auth_method VARCHAR(50) DEFAULT 'api_key' CHECK (auth_method IN ('api_key', 'oauth', 'hybrid'));
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS primary_oauth_installation_id UUID REFERENCES oauth_installations(id);

-- Create function to handle OAuth token refresh
CREATE OR REPLACE FUNCTION refresh_oauth_token(p_installation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_refresh_count INTEGER;
BEGIN
    -- Get current expiration and refresh count
    SELECT expires_at, refresh_count 
    INTO v_expires_at, v_refresh_count
    FROM oauth_installations 
    WHERE id = p_installation_id AND active = true;
    
    -- Check if refresh is needed (refresh 1 hour before expiry)
    IF v_expires_at - INTERVAL '1 hour' > NOW() THEN
        RETURN false; -- No refresh needed
    END IF;
    
    -- Update refresh count (actual refresh handled by application)
    UPDATE oauth_installations
    SET refresh_count = refresh_count + 1,
        last_refreshed_at = NOW()
    WHERE id = p_installation_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM oauth_states 
    WHERE expires_at < NOW() OR used = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for OAuth installation status
CREATE OR REPLACE VIEW oauth_installation_status AS
SELECT 
    oi.id,
    oi.tenant_id,
    t.name as tenant_name,
    oi.location_id,
    oi.expires_at,
    oi.expires_at - NOW() as time_until_expiry,
    oi.refresh_count,
    oi.last_refreshed_at,
    oi.active,
    oi.install_source,
    array_length(oi.scopes, 1) as scope_count,
    mi.subscription_status,
    mi.trial_ends_at
FROM oauth_installations oi
JOIN tenants t ON oi.tenant_id = t.id
LEFT JOIN marketplace_installations mi ON mi.oauth_installation_id = oi.id
WHERE oi.active = true;

-- Create trigger to update marketplace installation timestamps
CREATE TRIGGER trigger_marketplace_updated_at
    BEFORE UPDATE ON marketplace_installations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE oauth_installations IS 'OAuth 2.0 installations from GoHighLevel marketplace';
COMMENT ON TABLE oauth_states IS 'Temporary storage for OAuth flow state parameters';
COMMENT ON TABLE oauth_refresh_log IS 'Audit log for OAuth token refresh operations';
COMMENT ON TABLE marketplace_installations IS 'GoHighLevel marketplace-specific installation data';
COMMENT ON COLUMN tenants.auth_method IS 'Authentication method: api_key (legacy), oauth (marketplace), or hybrid';
COMMENT ON COLUMN tenants.primary_oauth_installation_id IS 'Primary OAuth installation for this tenant';