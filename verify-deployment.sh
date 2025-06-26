#!/bin/bash

echo "🔍 Vercel Deployment Verification"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required files exist
echo -e "\n📁 Checking required files..."
required_files=(
  "package.json"
  "tsconfig.json"
  "next.config.js"
  "tailwind.config.js"
  "postcss.config.js"
  "src/app/layout.tsx"
  "src/app/page.tsx"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file exists"
  else
    echo -e "${RED}✗${NC} $file missing"
  fi
done

# Check environment example
echo -e "\n🔐 Environment Variables Template..."
if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓${NC} .env.example exists"
  echo "Required environment variables:"
  grep -E "^[A-Z]" .env.example | sed 's/=.*//' | while read var; do
    echo "  - $var"
  done
else
  echo -e "${YELLOW}⚠${NC} No .env.example found"
fi

# Check for common issues
echo -e "\n🚨 Checking for common issues..."

# Check for unused dependencies
echo -e "\n📦 Checking package.json..."
if grep -q "python-shell" package.json; then
  echo -e "${RED}✗${NC} python-shell found - should be removed"
else
  echo -e "${GREEN}✓${NC} No python-shell dependency"
fi

# Check API routes
echo -e "\n🔌 Checking API routes..."
api_routes=$(find src/app/api -name "route.ts" 2>/dev/null | wc -l)
echo -e "${GREEN}✓${NC} Found $api_routes API route files"

# Check for TypeScript issues in key files
echo -e "\n📝 Quick TypeScript checks..."
key_files=(
  "src/lib/auth/tenant-auth.ts"
  "src/lib/db/neon-mcp-client.ts"
  "src/lib/rl-integration/rl-client.ts"
)

for file in "${key_files[@]}"; do
  if [ -f "$file" ]; then
    # Check for common issues
    if grep -q "createCipher\|createDecipher" "$file"; then
      echo -e "${RED}✗${NC} $file uses deprecated crypto methods"
    else
      echo -e "${GREEN}✓${NC} $file crypto methods OK"
    fi
  fi
done

echo -e "\n✅ Verification complete!"
echo -e "\n📋 Next steps:"
echo "1. Fix any issues found above"
echo "2. Run: vercel --prod"
echo "3. Add environment variables in Vercel dashboard"
echo "4. Test deployment with health endpoint"