# 🚀 Deployment Guide - GoHighLevel MCP Platform v2.0

## Quick Deploy to Vercel

### Prerequisites
- Vercel account (free tier works)
- GitHub account
- GoHighLevel marketplace app credentials

### Step 1: Push to GitHub
```bash
# If you haven't set up a remote yet
git remote add origin https://github.com/YOUR_USERNAME/ghl-mcp-platform.git

# Push all changes
git push -u origin master
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Environment Variables
Add these in Vercel Dashboard > Settings > Environment Variables:

```env
# Database (Required)
DATABASE_URL=postgresql://user:pass@host/database?sslmode=require

# Security (Required)
JWT_SECRET=your-secure-jwt-secret-min-32-chars
API_KEY_SALT=your-secure-api-key-salt
ENCRYPTION_KEY=your-32-character-encryption-key!
INTERNAL_API_SECRET=your-internal-api-secret

# GoHighLevel OAuth (Required)
GHL_OAUTH_CLIENT_ID=your-oauth-client-id
GHL_OAUTH_CLIENT_SECRET=your-oauth-client-secret
GHL_BASE_URL=https://services.leadconnectorhq.com

# Application URL (Required)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Optional but Recommended
RL_API_URL=https://your-rl-system.com
RL_API_KEY=your-rl-api-key
RL_ANONYMIZATION_SALT=your-rl-anonymization-salt
APP_VERSION=2.0.0
```

### Step 4: Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete (3-5 minutes)
3. Your app will be live at: `https://your-app-name.vercel.app`

### Step 5: Initialize Database
Once deployed, initialize your database:

```bash
curl -X POST https://your-app-name.vercel.app/api/admin/init-db \
  -H "X-Admin-Key: your-admin-key"
```

### Step 6: Test OAuth Flow
1. Visit: `https://your-app-name.vercel.app/onboarding`
2. Click "Connect GoHighLevel Account"
3. Authorize the app
4. Save your API key

### Step 7: Verify Deployment
Check these endpoints:
- `/` - Home page with new design
- `/docs` - Interactive knowledge base
- `/api-reference` - API documentation
- `/onboarding` - OAuth onboarding
- `/api/health` - Health check

## Production Checklist

### Before Going Live
- [ ] All environment variables set
- [ ] Database initialized
- [ ] OAuth credentials verified
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Rate limiting configured
- [ ] Error tracking setup (optional)

### Security
- [ ] Change default admin key
- [ ] Rotate encryption keys
- [ ] Enable Vercel security headers
- [ ] Set up CORS properly
- [ ] Review OAuth scopes

### Performance
- [ ] Enable Vercel Analytics
- [ ] Set up monitoring
- [ ] Configure caching headers
- [ ] Optimize database queries

## Troubleshooting Deployment

### Build Fails
```bash
# Check locally first
npm run build
npm run type-check
```

### Environment Variables Not Working
- Ensure no quotes in Vercel env values
- Check for trailing spaces
- Verify variable names match exactly

### Database Connection Issues
- Whitelist Vercel IPs in Neon
- Check SSL mode is 'require'
- Verify connection string format

### OAuth Redirect Issues
- Update redirect URI in GHL app settings
- Must match exactly (no trailing slash!)
- Clear browser cookies and retry

## Post-Deployment

### Monitor Your App
- Vercel Dashboard: Check function logs
- Database: Monitor connections
- API Usage: Track rate limits

### Regular Maintenance
- Update dependencies monthly
- Rotate API keys quarterly
- Review error logs weekly
- Backup database daily

## Support

- Documentation: `/docs`
- API Reference: `/api-reference`
- Troubleshooting: `/docs/TROUBLESHOOTING.md`
- GitHub Issues: [your-repo/issues]

---

**Deployment typically takes 5-10 minutes. The OAuth fix and documentation updates are all included in the latest commits.**