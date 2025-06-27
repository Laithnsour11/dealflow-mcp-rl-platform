# 🔧 Troubleshooting Guide - GoHighLevel MCP Platform

## Common Issues & Solutions

### 🔐 Authentication Issues

#### "Subdomain parameter required" Error
**Problem**: Getting this error when trying to connect via OAuth  
**Cause**: OAuth flow attempting to access tenant data before tenant exists  
**Solution**: 
- Platform now uses simplified OAuth flow
- Visit `/onboarding` and click "Connect GoHighLevel Account"
- OAuth will create tenant automatically after authorization

#### "Invalid API Key" Error
**Problem**: API key not working for requests  
**Causes & Solutions**:
1. **Typo in API key**: Check for extra spaces or missing characters
2. **Wrong header name**: Use `X-Tenant-API-Key` (case-sensitive)
3. **Key not active**: Ensure OAuth installation completed successfully
4. **Expired key**: Re-authenticate via OAuth if key expired

#### OAuth Redirect Error
**Problem**: "Invalid redirect URI" error from GoHighLevel  
**Solution**:
1. Check your GHL app settings
2. Ensure redirect URI matches exactly: `https://your-app.vercel.app/api/auth/ghl/callback`
3. No trailing slash!
4. Update `GHL_OAUTH_REDIRECT_URI` in environment variables

### 🌐 API Request Issues

#### Rate Limit Exceeded
**Problem**: Getting 429 errors  
**Solutions**:
1. Implement request throttling
2. Use webhooks instead of polling
3. Batch operations where possible
4. Contact support for limit increase

#### "Tool not found" Error
**Problem**: MCP tool endpoint returns 404  
**Causes & Solutions**:
1. **Typo in tool name**: Check [API Reference](./API-REFERENCE.md) for exact names
2. **Wrong HTTP method**: All MCP endpoints use POST
3. **Missing trailing slash**: Don't add trailing slashes to URLs

#### Empty Response Data
**Problem**: API returns success but no data  
**Possible Causes**:
1. **Wrong location/company ID**: Verify your OAuth installation
2. **Missing permissions**: Re-authorize with all required scopes
3. **Data doesn't exist**: Check in GoHighLevel directly

### 🚀 Deployment Issues

#### Vercel Build Failure
**Problem**: Deployment fails on Vercel  
**Common Solutions**:
1. **TypeScript errors**: Run `npm run type-check` locally
2. **Missing env vars**: Add all required variables in Vercel dashboard
3. **Build timeout**: Split large files or increase build limits
4. **Memory issues**: Upgrade Vercel plan or optimize imports

#### Database Connection Error
**Problem**: "Cannot connect to database"  
**Solutions**:
1. Check `DATABASE_URL` format: `postgresql://user:pass@host/db?sslmode=require`
2. Whitelist Vercel IPs in Neon dashboard
3. Ensure database is active (not suspended)
4. Verify SSL mode is set to `require`

### 🔧 Setup Issues

#### Database Not Initialized
**Problem**: "Database tables not found"  
**Solution**:
```bash
# Initialize database tables
curl -X POST https://your-app.vercel.app/api/admin/init-db \
  -H "X-Admin-Key: your-admin-key"
```

#### Missing Environment Variables
**Problem**: "Environment variable X is not defined"  
**Solution**:
1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. For Vercel: Add in Dashboard > Settings > Environment Variables
4. Redeploy after adding variables

### 🐛 Runtime Errors

#### Crypto Import Error
**Problem**: Build fails with crypto module error  
**Solution**: Already fixed - use `import * as crypto from 'crypto'`

#### Dynamic Rendering Error
**Problem**: "Route couldn't be rendered statically"  
**Solution**: Add `export const dynamic = 'force-dynamic'` to route files

#### Suspense Boundary Error
**Problem**: "useSearchParams() should be wrapped in suspense"  
**Solution**: Wrap components using search params in `<Suspense>` tags

### 📊 RL Integration Issues

#### "RL System Unavailable"
**Problem**: RL analysis failing  
**Solutions**:
1. Check `RL_API_URL` is set correctly
2. Verify `RL_API_KEY` is valid
3. Ensure RL system is operational
4. Check network connectivity

#### Low RL Accuracy
**Problem**: RL scores seem incorrect  
**Solutions**:
1. Ensure conversation data is complete
2. Include both sides of conversation
3. Provide sufficient context
4. Check for proper formatting

## 🆘 Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Review error logs in Vercel dashboard
3. Test with minimal reproduction
4. Gather relevant information:
   - Error messages
   - Request/response data
   - Environment details
   - Steps to reproduce

### Support Channels
1. **GitHub Issues**: For bugs and feature requests
2. **Documentation**: Check all `/docs` files
3. **Community**: GoHighLevel Developer Slack
4. **Email**: support@your-domain.com

### Providing Good Bug Reports
Include:
- Platform version (check `/api/health`)
- Error message and stack trace
- Request details (endpoint, headers, body)
- Expected vs actual behavior
- Steps to reproduce
- Environment (local/production)

## 🔍 Debugging Tips

### Enable Debug Logging
```typescript
// Add to your .env.local
DEBUG=true
LOG_LEVEL=verbose
```

### Test Individual Components
```bash
# Test OAuth flow
curl https://your-app.vercel.app/api/auth/ghl/start?userType=Location

# Test MCP endpoint
curl -X POST https://your-app.vercel.app/api/mcp/search_contacts \
  -H "X-Tenant-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'

# Check health
curl https://your-app.vercel.app/api/health
```

### Common Debugging Commands
```bash
# Check TypeScript
npm run type-check

# Test build locally
npm run build

# Check for linting issues
npm run lint

# View real-time logs
vercel logs --follow
```

## 📋 Quick Fixes Checklist

- [ ] All environment variables set in Vercel?
- [ ] Database initialized with schema?
- [ ] OAuth credentials correct?
- [ ] Redirect URI matches exactly?
- [ ] Using correct API headers?
- [ ] API key format correct (tk_...)?
- [ ] Request body is valid JSON?
- [ ] Using POST for all MCP endpoints?
- [ ] No trailing slashes in URLs?
- [ ] SSL mode set for database?

## 🚨 Emergency Contacts

- **Critical Issues**: emergency@your-domain.com
- **Security Issues**: security@your-domain.com
- **Status Page**: https://status.your-domain.com

---

Remember: Most issues have simple solutions. Check the basics first!