# GHL MCP + RL Platform

Multi-tenant GoHighLevel MCP Server with 96.7% accuracy Reinforcement Learning integration for AI-powered sales conversations.

## 🚀 Vercel Deployment Guide

### Prerequisites
- Vercel account (free tier works)
- Neon database account (for PostgreSQL)
- GoHighLevel API credentials
- Git repository (GitHub/GitLab/Bitbucket)

### Step 1: Push to Git Repository
```bash
git init
git add .
git commit -m "Initial commit - GHL MCP + RL Platform"
git remote add origin YOUR_GIT_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Step 3: Required Environment Variables

Add these in Vercel's project settings under "Environment Variables":

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Security Keys
API_KEY_SALT=your-random-salt-string-change-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-change-this
JWT_SECRET=your-jwt-secret-key-change-in-production
RL_ANONYMIZATION_SALT=your-rl-salt-change-in-production

# RL System API
RL_API_URL=http://your-rl-api-endpoint:5002
RL_API_KEY=your-rl-api-key-if-needed

# GoHighLevel (optional - tenants will provide their own)
GHL_API_KEY=your-master-ghl-api-key
GHL_LOCATION_ID=your-master-location-id

# Platform Settings
NEXT_PUBLIC_APP_NAME=GHL MCP + RL Platform
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app
```

### Step 4: Initialize Database

After deployment, initialize the database schema:

```bash
curl -X POST https://your-app.vercel.app/api/admin/init-db \
  -H "X-Admin-Key: your-admin-key"
```

### Step 5: Create First Tenant

```bash
curl -X POST https://your-app.vercel.app/api/tenant/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Company",
    "email": "admin@yourcompany.com",
    "ghlApiKey": "ghl_api_key",
    "ghlLocationId": "location_id"
  }'
```

## 📚 API Documentation

### MCP Endpoints (269+ GHL Tools)
- `POST /api/mcp/[tool]` - Execute any GHL MCP tool
- Headers: `X-Tenant-API-Key: your_tenant_key`

### RL Analysis Endpoints
- `POST /api/rl/analyze` - Full conversation analysis
- `POST /api/rl/real-time` - Real-time guidance
- `POST /api/rl/compare` - A/B testing
- `GET /api/rl/health` - System health check

### Example: Analyze Conversation
```bash
curl -X POST https://your-app.vercel.app/api/rl/analyze \
  -H "X-Tenant-API-Key: your_tenant_key" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": [
      {"speaker": "customer", "message": "I need to sell my house quickly"},
      {"speaker": "sales_rep", "message": "I can help. What's your timeline?"}
    ]
  }'
```

## 🔧 Features

- **Multi-tenant Architecture**: Complete tenant isolation with API keys
- **269+ GHL Tools**: Full GoHighLevel MCP integration
- **96.7% RL Accuracy**: Advanced conversation analysis
- **Real-time Guidance**: Live sales coaching
- **DISC Personality Detection**: Adaptive communication
- **Motivation Analysis**: Foreclosure, divorce, inheritance detection
- **A/B Testing**: Optimize conversation approaches
- **Usage Tracking**: Built-in analytics and billing

## 🛡️ Security Features

- Encrypted GHL credentials per tenant
- API key authentication
- Rate limiting (100 req/min default)
- Anonymized data for RL training
- JWT token support

## 📊 Monitoring

View platform metrics at:
- Dashboard: `https://your-app.vercel.app`
- Vercel Analytics: Built-in performance monitoring
- API Usage: Per-tenant tracking in database

## 🤝 Support

For issues or questions:
- Check Vercel logs for errors
- Verify environment variables are set
- Ensure database is initialized
- Test with the health endpoint first

## 📝 License

Proprietary - All rights reserved