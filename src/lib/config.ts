/**
 * Runtime configuration that safely handles environment variables
 * Works in both server and edge runtime environments
 */

export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  apiKeySalt: process.env.API_KEY_SALT || 'dev-salt',
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-characters!',
  rlAnonymizationSalt: process.env.RL_ANONYMIZATION_SALT || 'dev-rl-salt',
  
  // External APIs
  rlApiUrl: process.env.RL_API_URL || 'http://localhost:5002',
  rlApiKey: process.env.RL_API_KEY || '',
  
  // GHL
  ghlBaseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
  
  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Neon MCP
  neonMcpServerUrl: process.env.NEON_MCP_SERVER_URL || 'http://localhost:8000',
}

// Type-safe config getter
export function getConfig<K extends keyof typeof config>(key: K): typeof config[K] {
  return config[key]
}