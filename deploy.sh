#!/bin/bash

echo "🚀 Deploying GHL MCP + RL Platform to Vercel..."
echo ""
echo "This will:"
echo "1. Deploy your Next.js app"
echo "2. Create a production deployment"
echo "3. Provide you with a URL"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Initialize database with /api/admin/init-db"
echo "3. Create your first tenant"
echo ""
echo "See README.md for detailed instructions."