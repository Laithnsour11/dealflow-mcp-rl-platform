-- Multi-tenant GHL MCP + RL Platform Database Schema
-- Created for Neon PostgreSQL with MCP integration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenants table - Core tenant management
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL, -- Hashed version for security
    ghl_api_key_encrypted TEXT NOT NULL, -- Encrypted GHL API key
    ghl_location_id VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
    usage_quota INTEGER NOT NULL DEFAULT 1000,
    current_usage INTEGER NOT NULL DEFAULT 0,
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT positive_quota CHECK (usage_quota >= 0),
    CONSTRAINT positive_usage CHECK (current_usage >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_api_key ON tenants(api_key);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);

-- Usage tracking table - Track API calls and costs per tenant
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time INTEGER, -- milliseconds
    status_code INTEGER NOT NULL,
    tokens_cost DECIMAL(10,4) DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_method CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    CONSTRAINT valid_status CHECK (status_code >= 100 AND status_code < 600)
);

-- Create indexes for usage analytics
CREATE INDEX IF NOT EXISTS idx_usage_tenant_timestamp ON usage_records(tenant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_endpoint ON usage_records(endpoint);
CREATE INDEX IF NOT EXISTS idx_usage_status ON usage_records(status_code);

-- RL analysis table - Store RL conversation analysis results (anonymized)
CREATE TABLE IF NOT EXISTS rl_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of tenant ID for privacy
    conversation_id_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of conversation ID
    conversation_data_hash VARCHAR(64) NOT NULL, -- Hash of conversation content
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('real_time', 'batch', 'compare')),
    final_probability DECIMAL(5,4) NOT NULL CHECK (final_probability >= 0 AND final_probability <= 1),
    final_confidence DECIMAL(5,4) NOT NULL CHECK (final_confidence >= 0 AND final_confidence <= 1),
    personality_type VARCHAR(20),
    motivation_type VARCHAR(50),
    objection_category VARCHAR(50),
    outcome VARCHAR(50),
    key_turning_points INTEGER[],
    recommendations TEXT[],
    processing_time INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for RL analytics
CREATE INDEX IF NOT EXISTS idx_rl_tenant_hash ON rl_analyses(tenant_id_hash);
CREATE INDEX IF NOT EXISTS idx_rl_analysis_type ON rl_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_rl_probability ON rl_analyses(final_probability);
CREATE INDEX IF NOT EXISTS idx_rl_timestamp ON rl_analyses(created_at);

-- Conversion outcomes table - Track deal progression and RL attribution
CREATE TABLE IF NOT EXISTS conversion_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL,
    contact_id VARCHAR(255) NOT NULL, -- GHL contact ID
    opportunity_id VARCHAR(255), -- GHL opportunity ID
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('discovery', 'lead_qualified', 'offer_made', 'contract_signed', 'closed_won', 'closed_lost')),
    rl_probability_at_stage DECIMAL(5,4),
    actual_outcome BOOLEAN,
    revenue DECIMAL(12,2),
    deal_value DECIMAL(12,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for conversion tracking
CREATE INDEX IF NOT EXISTS idx_outcomes_tenant_id ON conversion_outcomes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_stage ON conversion_outcomes(stage);
CREATE INDEX IF NOT EXISTS idx_outcomes_timestamp ON conversion_outcomes(timestamp);
CREATE INDEX IF NOT EXISTS idx_outcomes_conversation ON conversion_outcomes(conversation_id);

-- AI agent configurations table
CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('voice', 'text', 'chat')),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('vapi', 'elevenlabs', 'custom')),
    specialization VARCHAR(100) NOT NULL,
    personality_targets TEXT[], -- Array of personality types this agent handles
    motivation_targets TEXT[], -- Array of motivation types this agent handles
    settings JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for agent management
CREATE INDEX IF NOT EXISTS idx_agents_tenant_active ON ai_agent_configs(tenant_id, active);
CREATE INDEX IF NOT EXISTS idx_agents_specialization ON ai_agent_configs(specialization);

-- Lead routing rules table
CREATE TABLE IF NOT EXISTS lead_routing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL, -- Flexible conditions for routing logic
    target_agent_id UUID REFERENCES ai_agent_configs(id),
    priority INTEGER NOT NULL DEFAULT 100,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for routing performance
CREATE INDEX IF NOT EXISTS idx_routing_tenant_active ON lead_routing_rules(tenant_id, active, priority);

-- Webhook events table - Track incoming webhooks
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL CHECK (source IN ('ghl', 'vapi', 'elevenlabs', 'stripe', 'internal')),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    processing_attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT max_attempts CHECK (processing_attempts <= 5)
);

-- Create indexes for webhook processing
CREATE INDEX IF NOT EXISTS idx_webhooks_tenant_processed ON webhook_events(tenant_id, processed);
CREATE INDEX IF NOT EXISTS idx_webhooks_source_type ON webhook_events(source, event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_received_at ON webhook_events(received_at);

-- A/B testing experiments table
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    variants JSONB NOT NULL, -- Array of test variants
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'paused')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for A/B testing
CREATE INDEX IF NOT EXISTS idx_ab_tests_tenant_status ON ab_tests(tenant_id, status);

-- Analytics metrics table - Store computed metrics
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12,4) NOT NULL,
    dimensions JSONB DEFAULT '{}', -- Additional dimensions for grouping
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_metrics_tenant_name ON analytics_metrics(tenant_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON analytics_metrics(timestamp);

-- Functions for automated tasks

-- Function to update tenant usage quota
CREATE OR REPLACE FUNCTION update_tenant_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tenants 
    SET current_usage = current_usage + 1,
        updated_at = NOW()
    WHERE id = NEW.tenant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic usage tracking
DROP TRIGGER IF EXISTS trigger_update_usage ON usage_records;
CREATE TRIGGER trigger_update_usage
    AFTER INSERT ON usage_records
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_usage();

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS trigger_tenants_updated_at ON tenants;
CREATE TRIGGER trigger_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_agents_updated_at ON ai_agent_configs;
CREATE TRIGGER trigger_agents_updated_at
    BEFORE UPDATE ON ai_agent_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_routing_updated_at ON lead_routing_rules;
CREATE TRIGGER trigger_routing_updated_at
    BEFORE UPDATE ON lead_routing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries

-- Tenant usage summary view
CREATE OR REPLACE VIEW tenant_usage_summary AS
SELECT 
    t.id,
    t.name,
    t.plan,
    t.status,
    t.usage_quota,
    t.current_usage,
    ROUND((t.current_usage::DECIMAL / t.usage_quota) * 100, 2) as usage_percentage,
    COUNT(ur.id) as total_requests_today,
    AVG(ur.response_time) as avg_response_time_today,
    SUM(ur.tokens_cost) as total_cost_today
FROM tenants t
LEFT JOIN usage_records ur ON t.id = ur.tenant_id 
    AND ur.timestamp >= CURRENT_DATE
GROUP BY t.id, t.name, t.plan, t.status, t.usage_quota, t.current_usage;

-- RL performance summary view
CREATE OR REPLACE VIEW rl_performance_summary AS
SELECT 
    tenant_id_hash,
    COUNT(*) as total_analyses,
    AVG(final_probability) as avg_probability,
    AVG(final_confidence) as avg_confidence,
    AVG(processing_time) as avg_processing_time,
    COUNT(*) FILTER (WHERE final_probability > 0.7) as high_probability_count,
    COUNT(*) FILTER (WHERE final_probability BETWEEN 0.4 AND 0.7) as medium_probability_count,
    COUNT(*) FILTER (WHERE final_probability < 0.4) as low_probability_count
FROM rl_analyses
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tenant_id_hash;

-- Grant appropriate permissions (to be customized based on deployment)
-- Note: In production, create specific users with limited permissions

-- Initial data (optional - for testing)
-- This would be handled by the application, not in schema

COMMENT ON TABLE tenants IS 'Core tenant management with encrypted GHL credentials';
COMMENT ON TABLE usage_records IS 'Track all API usage for billing and rate limiting';
COMMENT ON TABLE rl_analyses IS 'Store RL analysis results with privacy hashing';
COMMENT ON TABLE conversion_outcomes IS 'Track deal progression for RL reward signals';
COMMENT ON TABLE ai_agent_configs IS 'AI agent configurations for lead routing';
COMMENT ON TABLE lead_routing_rules IS 'Rules for routing leads to appropriate agents';
COMMENT ON TABLE webhook_events IS 'Incoming webhook events from external systems';
COMMENT ON TABLE ab_tests IS 'A/B testing experiments and results';
COMMENT ON TABLE analytics_metrics IS 'Computed analytics metrics for dashboards';