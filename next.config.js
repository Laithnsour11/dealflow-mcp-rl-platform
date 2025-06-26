/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg']
  },
  
  
  // Vercel deployment optimizations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  
  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Tenant-API-Key' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ]
  },
  
  // Redirects for MCP endpoints
  async rewrites() {
    return [
      {
        source: '/mcp/:path*',
        destination: '/api/mcp/:path*',
      },
      {
        source: '/rl/:path*', 
        destination: '/api/rl/:path*',
      },
    ]
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    return config
  },
}

module.exports = nextConfig