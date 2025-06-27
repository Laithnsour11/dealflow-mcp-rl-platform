import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

const sql = neon(process.env.DATABASE_URL);

async function initDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Create tenants table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(255) UNIQUE NOT NULL,
        subdomain VARCHAR(255) UNIQUE NOT NULL,
        auth_method VARCHAR(50) NOT NULL,
        oauth_installation_id UUID,
        private_api_key VARCHAR(255),
        location_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Create oauth_installations table
    await sql`
      CREATE TABLE IF NOT EXISTS oauth_installations (
        id UUID PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL,
        location_id VARCHAR(255) NOT NULL,
        company_id VARCHAR(255),
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        scopes TEXT[] NOT NULL,
        installed_at TIMESTAMP NOT NULL,
        last_refreshed_at TIMESTAMP,
        install_source VARCHAR(50) NOT NULL,
        app_version VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Create api_keys table
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(255) NOT NULL,
        key_hash VARCHAR(255) UNIQUE NOT NULL,
        key_prefix VARCHAR(20) NOT NULL,
        name VARCHAR(255),
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
      )
    `;
    
    // Create request_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS request_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(255) NOT NULL,
        api_key_id UUID,
        endpoint VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        status_code INTEGER,
        response_time_ms INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
        FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
      )
    `;
    
    // Create rate_limits table
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(255) NOT NULL,
        window_start TIMESTAMP NOT NULL,
        window_end TIMESTAMP NOT NULL,
        request_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_oauth_installations_tenant ON oauth_installations(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_request_logs_tenant ON request_logs(tenant_id, created_at)`;
    
    console.log('✅ Database tables initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();