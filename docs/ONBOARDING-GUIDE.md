# 🚀 GoHighLevel MCP Platform - Complete Onboarding Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Authentication Methods](#authentication-methods)
3. [OAuth 2.0 Setup (Marketplace)](#oauth-20-setup-marketplace)
4. [Private Integration Key Setup](#private-integration-key-setup)
5. [Testing Your Integration](#testing-your-integration)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

## 🏃 Quick Start

### Option 1: OAuth 2.0 (Recommended for Marketplace Apps)
1. Visit: `https://your-app-domain.vercel.app/onboarding`
2. Click "Connect with GoHighLevel"
3. Authorize all 22 required scopes
4. You're connected! 🎉

### Option 2: Private Integration Key
1. Get your Private Integration Key from GoHighLevel
2. Visit: `https://your-app-domain.vercel.app/onboarding/private-key`
3. Enter your key and location ID
4. Click "Connect" - Done! ✅

## 🔐 Authentication Methods

### OAuth 2.0 (For Marketplace Distribution)
**Best for**: Apps distributed on GoHighLevel marketplace
- ✅ Automatic token refresh
- ✅ User-friendly authorization
- ✅ Multiple location support
- ✅ Marketplace compliance

### Private Integration Key (For Internal Use)
**Best for**: Single agency/location implementations
- ✅ Quick setup
- ✅ Direct API access
- ✅ No OAuth complexity
- ✅ Full API permissions

## 🎯 OAuth 2.0 Setup (Marketplace)

### Step 1: Create Your Marketplace App

1. **Login to GoHighLevel** → Settings → My Apps
2. **Click "Create App"**
3. **Fill in App Details**:
   ```
   App Name: Your MCP Integration
   App Type: OAuth 2.0
   Redirect URI: https://your-app-domain.vercel.app/api/auth/ghl/callback
   ```

4. **Select ALL Required Scopes** (22 total):
   - ✅ `contacts.readonly` / `contacts.write`
   - ✅ `conversations/message.readonly` / `conversations/message.write`
   - ✅ `calendars.readonly` / `calendars.write`
   - ✅ `opportunities.readonly` / `opportunities.write`
   - ✅ `invoices.readonly` / `invoices.write`
   - ✅ `payments.readonly` / `payments.write`
   - ✅ `social-media-posting.readonly` / `social-media-posting.write`
   - ✅ `users.readonly` / `users.write`
   - ✅ `businesses.readonly` / `businesses.write`
   - ✅ `workflows.readonly`
   - ✅ `locations.readonly`

5. **Save Your Credentials**:
   ```env
   GHL_OAUTH_CLIENT_ID=your_client_id_here
   GHL_OAUTH_CLIENT_SECRET=your_client_secret_here
   ```

### Step 2: Configure Your Platform

1. **Update Environment Variables** in Vercel:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add/Update:
     ```
     GHL_OAUTH_CLIENT_ID=your_actual_client_id
     GHL_OAUTH_CLIENT_SECRET=your_actual_client_secret
     ```

2. **Redeploy** your application

### Step 3: Test OAuth Flow

1. Visit `https://your-app-domain.vercel.app/onboarding`
2. Click "Connect with GoHighLevel"
3. You'll be redirected to GoHighLevel
4. Login and select your location
5. Review and approve all permissions
6. You'll be redirected back to success page

## 🔑 Private Integration Key Setup

### Step 1: Generate Private Integration Key

1. **Login to GoHighLevel**
2. **Navigate to**: Settings → Integrations → API Keys
3. **Click "Generate API Key"**
4. **Name your key**: "MCP Platform Integration"
5. **Copy the key** (you won't see it again!)

### Step 2: Find Your Location ID

1. **In GoHighLevel**, go to Settings → Business Profile
2. **Copy your Location ID** (looks like: `loc_ABC123...`)

### Step 3: Connect Using Private Key

1. Visit `https://your-app-domain.vercel.app/onboarding/private-key`
2. Enter:
   - **API Key**: Your Private Integration Key
   - **Location ID**: Your GoHighLevel Location ID
3. Click "Connect with Private Key"

## 🧪 Testing Your Integration

### 1. Test Basic Connection
```bash
curl -X POST https://your-app-domain.vercel.app/api/mcp/search_contacts \
  -H "X-Tenant-API-Key: your_tenant_api_key" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Test Contact Creation
```bash
curl -X POST https://your-app-domain.vercel.app/api/mcp/create_contact \
  -H "X-Tenant-API-Key: your_tenant_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Contact",
    "email": "test@example.com"
  }'
```

### 3. Verify in GoHighLevel
- Check Contacts section for new test contact
- Verify API usage in Settings → API Keys

## 🔧 Troubleshooting

### OAuth Issues

**"Access Denied" Error**
- ✅ Make sure you're logged into the correct GHL account
- ✅ Verify all 22 scopes are selected in your app
- ✅ Check redirect URI matches exactly

**"Invalid State" Error**
- ✅ Clear browser cookies and try again
- ✅ Make sure you complete flow within 10 minutes
- ✅ Don't use back button during OAuth flow

**"Callback Failed" Error**
- ✅ Verify OAuth credentials in environment variables
- ✅ Check Vercel deployment logs
- ✅ Ensure database is initialized

### Private Key Issues

**"Invalid API Key" Error**
- ✅ Check key hasn't been regenerated in GHL
- ✅ Verify no extra spaces in the key
- ✅ Ensure key has necessary permissions

**"Location Not Found" Error**
- ✅ Verify location ID is correct
- ✅ Check API key is for the right location
- ✅ Ensure location is active in GHL

### General Issues

**Database Not Initialized**
```bash
# Initialize database
curl -X POST https://your-app-domain.vercel.app/api/admin/init-db \
  -H "X-Admin-Key: your-admin-key"
```

**Check Platform Health**
```bash
curl https://your-app-domain.vercel.app/api/health
```

## 📊 Understanding Your Dashboard

Once connected, you'll have access to:

1. **API Usage Metrics**
   - Requests per day
   - Response times
   - Error rates

2. **Available Tools** (269 total)
   - Contact Management (31 tools)
   - Messaging (20 tools)
   - Invoicing (39 tools)
   - Payments (20 tools)
   - And many more...

3. **RL Analysis**
   - Conversation insights
   - Lead scoring
   - Optimization recommendations

## 🎯 Next Steps

### 1. Initialize Your First Tenant
```javascript
// Example API call to create contact
const response = await fetch('https://your-app-domain.vercel.app/api/mcp/create_contact', {
  method: 'POST',
  headers: {
    'X-Tenant-API-Key': 'your_tenant_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  })
});
```

### 2. Explore Available Tools
- View all 269 tools in the [API Documentation](./API-REFERENCE.md)
- Try different endpoints
- Build your integration

### 3. Enable RL Analysis
- Send conversation data for analysis
- Get AI-powered insights
- Optimize your sales process

## 🆘 Need Help?

- 📖 [API Documentation](./API-REFERENCE.md)
- 🛠️ [Developer Guide](./DEVELOPER-GUIDE.md)
- 💬 [GoHighLevel Developer Slack](https://www.gohighlevel.com/dev-slack)
- 📧 Support: support@your-domain.com

## 🎉 Welcome to the Platform!

You're now ready to leverage all 269 GoHighLevel tools plus advanced AI analysis. Start building amazing integrations!

---

**Pro Tips**:
- 💡 Start with basic contact operations before moving to complex tools
- 🔄 Use webhooks for real-time updates
- 📊 Monitor your API usage to stay within limits
- 🚀 Leverage RL insights for better conversion rates