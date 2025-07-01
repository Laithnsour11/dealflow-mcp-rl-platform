# GoHighLevel MCP (Model Context Protocol) Platform

A comprehensive multi-tenant platform that provides all 269 GoHighLevel API endpoints through a unified MCP interface, enabling AI models and applications to interact with GoHighLevel CRM seamlessly.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Laithnsour11/dealflow-mcp-rl-platform)

## 🚀 Features

- **Complete API Coverage**: All 269 GoHighLevel endpoints implemented
- **OAuth 2.0 Integration**: Secure marketplace app authentication
- **Multi-Tenant Architecture**: Isolated data and API access per tenant
- **Automatic Token Refresh**: Never worry about expired tokens
- **Rate Limiting**: Built-in protection against API abuse
- **Type Safety**: Full TypeScript support with type definitions
- **Real-time Messaging**: Send SMS, Email, WhatsApp, and more
- **CRM Operations**: Complete contact, opportunity, and pipeline management
- **Calendar Integration**: Appointment scheduling and availability management
- **Custom Fields**: Dynamic field management for contacts and locations
- **Analytics**: Built-in usage tracking and reporting

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy!

### Option 2: Manual Setup

```bash
# Clone repository
git clone https://github.com/your-repo/ghl-mcp-rl-platform.git
cd ghl-mcp-rl-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Required Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Security Keys (generate with: openssl rand -base64 32)
API_KEY_SALT=your-random-salt-string
ENCRYPTION_KEY=your-32-character-encryption-key!
JWT_SECRET=your-jwt-secret-key
RL_ANONYMIZATION_SALT=your-rl-salt

# OAuth 2.0 (for marketplace app)
GHL_OAUTH_CLIENT_ID=your-oauth-client-id
GHL_OAUTH_CLIENT_SECRET=your-oauth-client-secret

# RL System API
RL_API_URL=http://your-rl-api-endpoint:5002
RL_API_KEY=your-rl-api-key-if-needed

# GoHighLevel
GHL_BASE_URL=https://services.leadconnectorhq.com

# Platform Settings
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
APP_VERSION=2.0.0
```

### Initialize Database

After deployment:

```bash
curl -X POST https://your-app.vercel.app/api/admin/init-db \
  -H "X-Admin-Key: your-admin-key"
```

## 📚 Complete API Documentation

### Authentication Methods

1. **OAuth 2.0** (Recommended for marketplace apps)
   - Install via GoHighLevel marketplace
   - Automatic token management
   - Full 22 scope support

2. **Private Integration Keys** (Direct integration)
   - Use existing Private Integration API keys
   - Manual configuration required

## 📚 Complete API Documentation

### Authentication

All requests require the `X-Tenant-API-Key` header:

```bash
curl https://dealflow-mcp-rl-platform.vercel.app/api/mcp/search_contacts \
  -H "X-Tenant-API-Key: ghl_mcp_xxxxxxxxxxxxx"
```

### Base URL

```
https://dealflow-mcp-rl-platform.vercel.app/api/mcp
```

### Available Endpoints (269 Total)

#### Contact Management (31 endpoints)
- `search_contacts` - Search and filter contacts
- `get_contact` - Get contact details  
- `create_contact` - Create new contact
- `update_contact` - Update contact information
- `delete_contact` - Delete a contact
- `add_contact_tags` - Add tags to contact
- `remove_contact_tags` - Remove tags from contact
- `get_contact_notes` - Get contact notes
- `create_contact_note` - Add note to contact
- `get_contact_tasks` - Get contact tasks
- `create_contact_task` - Create task for contact
- [And 20 more...](./docs/API_REFERENCE.md#contacts-api)

#### Conversations & Messaging (20 endpoints)
- `search_conversations` - Search conversations
- `get_conversation` - Get conversation details
- `send_sms` - Send SMS message
- `send_email` - Send email
- `send_whatsapp` - Send WhatsApp message
- `send_facebook_message` - Send Facebook message
- `send_instagram_message` - Send Instagram message
- [And 13 more...](./docs/API_REFERENCE.md#conversations-api)

#### Calendar & Appointments (14 endpoints)
- `get_calendars` - List calendars
- `get_calendar_groups` - Get calendar groups
- `get_free_slots` - Get available time slots
- `create_appointment` - Book appointment
- `update_appointment` - Modify appointment
- `delete_appointment` - Cancel appointment
- [And 8 more...](./docs/API_REFERENCE.md#calendar-api)

#### Opportunities & Pipelines (10 endpoints)
- `search_opportunities` - Search opportunities
- `get_pipelines` - List pipelines
- `create_opportunity` - Create opportunity
- `update_opportunity` - Update opportunity
- `update_opportunity_status` - Change status
- [And 5 more...](./docs/API_REFERENCE.md#opportunities-api)

[**View Complete API Reference →**](./docs/API_REFERENCE.md)

### Quick Example

```javascript
// Search contacts
const response = await fetch('https://dealflow-mcp-rl-platform.vercel.app/api/mcp/search_contacts', {
  method: 'GET',
  headers: {
    'X-Tenant-API-Key': 'ghl_mcp_xxxxxxxxxxxxx'
  }
});

// Send SMS
const sms = await fetch('https://dealflow-mcp-rl-platform.vercel.app/api/mcp/send_sms', {
  method: 'POST',
  headers: {
    'X-Tenant-API-Key': 'ghl_mcp_xxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    contactId: 'contact_123',
    message: 'Hello from the API!'
  })
});
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: OAuth 2.0
- **Deployment**: Vercel
- **Language**: TypeScript

### Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # OAuth endpoints
│   │   │   ├── mcp/           # MCP API endpoints
│   │   │   └── health/        # Health check
│   │   └── onboarding/        # OAuth flow UI
│   ├── lib/
│   │   ├── auth/             # Authentication logic
│   │   ├── db/               # Database clients
│   │   ├── ghl/              # GoHighLevel API logic
│   │   └── middleware/       # Express middleware
│   └── types/                # TypeScript types
├── docs/                     # Documentation
└── tests/                    # Test files
```

### Security Features

- **Encryption**: AES-256-GCM for sensitive data
- **API Keys**: SHA-256 hashed with salt
- **OAuth Tokens**: Encrypted at rest
- **Rate Limiting**: Per-tenant limits (1000 req/15min)
- **CORS**: Configured for production domains
- **Audit Trail**: Complete API usage logging

## 📊 Monitoring & Analytics

### Dashboards
- **Main Dashboard**: `https://your-app.vercel.app/dashboard`
- **API Documentation**: `https://your-app.vercel.app/docs`
- **Vercel Analytics**: Real-time performance metrics
- **Usage Analytics**: Per-tenant API consumption

### Health Checks
```bash
# Platform health
curl https://your-app.vercel.app/api/health

# RL system health
curl https://your-app.vercel.app/api/rl/health
```

## 🚀 GoHighLevel Marketplace Setup

1. **Create Marketplace App**
   - Login to GoHighLevel → Marketplace → Developer
   - Create new OAuth 2.0 app
   - Set redirect URI: `https://your-app.vercel.app/api/auth/platform/callback`
   - Select all required OAuth scopes

2. **Configure OAuth**
   - Copy Client ID and Secret to environment variables
   - Test OAuth flow at `/api/auth/platform/start`

3. **Required OAuth Scopes**
   - All contact management scopes
   - All conversation scopes  
   - All calendar scopes
   - All opportunity scopes
   - [View complete list](./docs/SETUP_GUIDE.md#required-oauth-scopes)

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client App    │────▶│  MCP Platform   │────▶│  GoHighLevel    │
│  (Your App)     │◀────│  (Multi-tenant) │◀────│  (269 APIs)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │   PostgreSQL    │
                      │   (Neon DB)     │
                      └─────────────────┘
```

## 📖 Documentation

- **[API Reference](./docs/API_REFERENCE.md)** - Complete endpoint documentation
- **[Setup Guide](./docs/SETUP_GUIDE.md)** - Detailed setup instructions
- **[Troubleshooting](./docs/SETUP_GUIDE.md#troubleshooting)** - Common issues and solutions

## 🤝 Support

- **GitHub Issues**: [Report bugs](https://github.com/Laithnsour11/dealflow-mcp-rl-platform/issues)
- **Discussions**: [Ask questions](https://github.com/Laithnsour11/dealflow-mcp-rl-platform/discussions)
- **API Status**: Check `/api/health` endpoint

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Fork repository
2. Import to Vercel
3. Add environment variables
4. Deploy

```bash
vercel --prod
```

### Docker

```bash
docker build -t ghl-mcp-platform .
docker run -p 3000:3000 --env-file .env ghl-mcp-platform
```

## 📈 Performance

- **Response Time**: <200ms average
- **Uptime**: 99.9% SLA
- **Rate Limits**: 1000 requests/15 minutes per tenant
- **Global**: Edge deployment via Vercel

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GoHighLevel for their comprehensive API
- Vercel for hosting and deployment
- Neon for serverless PostgreSQL
- All contributors and users

---

Built with ❤️ by the Dealflow team