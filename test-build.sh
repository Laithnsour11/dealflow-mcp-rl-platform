#!/bin/bash

echo "🧪 Testing Next.js Build Locally"
echo "================================"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache

# Set minimal env vars for build
export DATABASE_URL="postgresql://test:test@localhost/test"
export JWT_SECRET="test-secret"
export API_KEY_SALT="test-salt"
export ENCRYPTION_KEY="test-encryption-key-32-characters"

# Run the build
echo "🔨 Running build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi