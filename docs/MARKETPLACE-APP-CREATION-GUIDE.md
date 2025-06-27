# GoHighLevel Marketplace App Creation Guide

## 🚀 Complete Step-by-Step Guide to Creating Your GHL Marketplace App

### Table of Contents
1. [Prerequisites](#prerequisites)
2. [Developer Account Setup](#developer-account-setup)
3. [Creating Your Marketplace App](#creating-your-marketplace-app)
4. [OAuth Configuration](#oauth-configuration)
5. [App Settings & Permissions](#app-settings--permissions)
6. [Testing Your App](#testing-your-app)
7. [Submission Process](#submission-process)
8. [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

Before creating your marketplace app, ensure you have:

- ✅ Active GoHighLevel Agency account
- ✅ Developer access enabled
- ✅ Production deployment URL (e.g., https://your-app.vercel.app)
- ✅ SSL certificate (HTTPS required)
- ✅ Privacy Policy and Terms of Service URLs

## Developer Account Setup

### Step 1: Access Developer Portal

1. Log into your GoHighLevel account
2. Navigate to **Settings** → **Developer** → **Apps**
3. If you don't see the Developer menu, contact GHL support to enable developer access

### Step 2: Join Developer Community

1. Visit [https://developers.gohighlevel.com/](https://developers.gohighlevel.com/)
2. Join the developer Slack channel: [https://www.gohighlevel.com/dev-slack](https://www.gohighlevel.com/dev-slack)
3. Access developer documentation and resources

## Creating Your Marketplace App

### Step 1: Create New App

1. In Developer Apps, click **"Create App"**
2. Choose app type:
   - **Private App** (recommended for testing)
   - **Public App** (for marketplace listing)

### Step 2: Basic Information

Fill in the required fields:

```
App Name: GoHighLevel MCP + RL Integration
Short Description: AI-powered automation with 269+ MCP tools
Category: Automation
App Type: OAuth 2.0
```

### Step 3: App Details

**Long Description:**
```
Transform your GoHighLevel CRM into an AI powerhouse with our comprehensive MCP integration. Access 269+ tools covering every aspect of GoHighLevel through a unified API.

Key Features:
• Complete API Coverage - All 269 MCP tools
• AI & RL Integration - Smart automation
• Multi-tenant Architecture - Enterprise security
• OAuth 2.0 Authentication - Secure access
• Real-time Webhooks - Instant updates

Perfect for agencies looking to automate workflows, integrate with AI systems, and scale operations efficiently.
```

**App Icon:**
- Size: 512x512px
- Format: PNG or JPG
- Background: Transparent or solid color

**Screenshots:**
- Minimum: 3 screenshots
- Size: 1280x720px or larger
- Show key features and UI

## OAuth Configuration

### Step 1: OAuth Settings

Configure your OAuth endpoints:

```
Client Type: Server-side Application
Authorization URL: https://services.leadconnectorhq.com/oauth/authorize
Token URL: https://services.leadconnectorhq.com/oauth/token
Redirect URI: https://your-app.vercel.app/api/auth/ghl/callback
```

### Step 2: Required Scopes

Select ALL required scopes for full MCP functionality:

**Read Scopes:**
- ✅ contacts.readonly
- ✅ conversations.readonly
- ✅ opportunities.readonly
- ✅ calendars.readonly
- ✅ locations.readonly
- ✅ workflows.readonly
- ✅ campaigns.readonly
- ✅ blogs.readonly
- ✅ users.readonly
- ✅ custom_objects.readonly
- ✅ invoices.readonly
- ✅ payments.readonly
- ✅ products.readonly

**Write Scopes:**
- ✅ contacts.write
- ✅ conversations.write
- ✅ opportunities.write
- ✅ calendars.write
- ✅ locations.write
- ✅ blogs.write
- ✅ custom_objects.write
- ✅ invoices.write
- ✅ products.write

### Step 3: Webhook Configuration (Optional)

If using webhooks:

```
Webhook URL: https://your-app.vercel.app/api/webhooks/ghl
Events: Select relevant events
Authentication: HMAC signature verification
```

## App Settings & Permissions

### Access Level

Choose the appropriate access level:

- **Location Level Access** (Sub-account) - Recommended
- **Agency Level Access** (Company) - For agency-wide features

### Installation Settings

```
Installation Type: OAuth Flow
User Type: Location (Sub-account)
Auto-install: Disabled (manual approval)
Trial Period: 14 days (optional)
```

### Compliance Settings

Required URLs:
```
Privacy Policy: https://your-app.vercel.app/privacy
Terms of Service: https://your-app.vercel.app/terms
Support URL: https://your-app.vercel.app/support
Documentation: https://your-app.vercel.app/docs
```

## Testing Your App

### Step 1: Create Test Location

1. Create a test sub-account in your GHL agency
2. Enable all necessary features and permissions
3. Generate test data (contacts, opportunities, etc.)

### Step 2: Install Your App

1. While in **Private App** mode, install on your test location
2. Go through the complete OAuth flow
3. Verify all permissions are granted

### Step 3: Test All Endpoints

Use our provided test script:

```bash
# Set your test credentials
export TENANT_API_KEY="your_test_key"
export GHL_LOCATION_ID="your_test_location"

# Run comprehensive tests
npm run test:mcp:production
```

### Step 4: Verify Features

Test critical features:
- ✅ OAuth token generation and refresh
- ✅ Contact CRUD operations
- ✅ Messaging capabilities
- ✅ Invoice and payment processing
- ✅ Custom object management
- ✅ Multi-tenant isolation

## Submission Process

### Pre-Submission Checklist

Before submitting for review:

- [ ] All 269 MCP tools tested and working
- [ ] OAuth flow completes successfully
- [ ] Error handling implemented
- [ ] Rate limiting respected
- [ ] Documentation complete
- [ ] Support system in place
- [ ] Privacy policy and ToS updated
- [ ] App icon and screenshots ready

### Step 1: Switch to Public App

1. In app settings, change from **Private** to **Public**
2. This triggers the review requirement

### Step 2: Submit for Review

1. Click **"Submit for Review"**
2. Fill out the review form:
   - Target audience description
   - Use cases and benefits
   - Security measures
   - Data handling practices

### Step 3: Review Process

Typical timeline:
- Initial review: 3-5 business days
- Feedback implementation: 2-3 days
- Final approval: 2-3 days

**Common review feedback:**
- Missing error messages
- Incomplete documentation
- Security concerns
- Scope justification needed

### Step 4: Post-Approval

Once approved:
1. Your app appears in the marketplace
2. Set up monitoring and alerts
3. Prepare support documentation
4. Create onboarding materials

## Common Issues & Solutions

### OAuth Issues

**Problem:** "Invalid redirect URI"
```
Solution: Ensure your redirect URI exactly matches:
- Include https://
- No trailing slash
- Correct domain and path
```

**Problem:** "Insufficient permissions"
```
Solution: User must approve ALL requested scopes
- Educate users on why each scope is needed
- Cannot function with partial permissions
```

### API Issues

**Problem:** "Rate limit exceeded"
```
Solution: Implement exponential backoff:
- Initial delay: 1 second
- Max delay: 60 seconds
- Max retries: 3
```

**Problem:** "Invalid location ID"
```
Solution: Location ID must match OAuth token:
- Extract from token response
- Don't hardcode location IDs
- Handle multi-location scenarios
```

### Submission Issues

**Problem:** "App rejected - security concerns"
```
Solution: Address security requirements:
- Encrypt all stored tokens
- Implement token rotation
- Add audit logging
- Document security measures
```

**Problem:** "Incomplete documentation"
```
Solution: Provide comprehensive docs:
- Installation guide with screenshots
- API endpoint documentation
- Video tutorials
- Troubleshooting guide
```

## Best Practices

### Security
- 🔒 Always use HTTPS
- 🔒 Encrypt tokens at rest
- 🔒 Implement token rotation (90 days)
- 🔒 Validate webhook signatures
- 🔒 Log all API access

### Performance
- ⚡ Cache frequently accessed data
- ⚡ Implement request queuing
- ⚡ Use batch operations where possible
- ⚡ Monitor API usage

### User Experience
- 🎯 Clear onboarding flow
- 🎯 Helpful error messages
- 🎯 Progress indicators
- 🎯 Success confirmations

## Support Resources

### Developer Resources
- Documentation: [https://highlevel.stoplight.io/](https://highlevel.stoplight.io/)
- API Reference: [https://public-api.gohighlevel.com/](https://public-api.gohighlevel.com/)
- Developer Slack: [https://www.gohighlevel.com/dev-slack](https://www.gohighlevel.com/dev-slack)

### Our Support
- Email: support@your-domain.com
- Documentation: https://your-app.vercel.app/docs
- Status Page: https://status.your-app.com

## Environment Variables

Required environment variables for production:

```env
# GoHighLevel OAuth
GHL_OAUTH_CLIENT_ID=your_client_id
GHL_OAUTH_CLIENT_SECRET=your_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
APP_VERSION=1.0.0

# Security
ENCRYPTION_KEY=base64_encoded_32_byte_key
JWT_SECRET=your_jwt_secret

# Database
DATABASE_URL=postgresql://...

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
```

---

## Quick Start Commands

```bash
# Clone the repository
git clone https://github.com/your-org/ghl-mcp-integration

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev

# Deploy to Vercel
vercel --prod
```

---

**Need Help?** Join our developer community or contact support@your-domain.com

*Last updated: [Current Date]*