#!/usr/bin/env node
/**
 * Vercel Deployment Validation Script
 * Tests compatibility with Vercel production deployment
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = __dirname

const results = []

function runTest(name, testFn) {
  try {
    console.log(`\n🔍 Running: ${name}...`)
    testFn()
    results.push({ test: name, status: 'pass', message: 'Test passed' })
    console.log(`✅ ${name} - PASSED`)
  } catch (error) {
    results.push({ test: name, status: 'fail', message: error.message, details: error })
    console.log(`❌ ${name} - FAILED: ${error.message}`)
  }
}

function runCommand(command, cwd = projectRoot) {
  try {
    return execSync(command, { cwd, encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.stderr || error.message}`)
  }
}

// Test 1: Check Next.js configuration
runTest('Next.js Configuration', () => {
  const nextConfigPath = path.join(projectRoot, 'next.config.js')
  if (!fs.existsSync(nextConfigPath)) {
    // Create minimal next.config.js if missing
    fs.writeFileSync(nextConfigPath, `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  env: {
    // Public env vars (prefixed with NEXT_PUBLIC_)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

module.exports = nextConfig
`)
    console.log('  ℹ️  Created next.config.js')
  }
})

// Test 2: Serverless Function Size Check
runTest('Serverless Function Compatibility', () => {
  const apiDir = path.join(projectRoot, 'src/app/api')
  const routeFiles = []
  
  function findRouteFiles(dir) {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        findRouteFiles(filePath)
      } else if (file === 'route.ts' || file === 'route.js') {
        routeFiles.push(filePath)
      }
    })
  }
  
  findRouteFiles(apiDir)
  
  // Check each route file
  routeFiles.forEach(routeFile => {
    const content = fs.readFileSync(routeFile, 'utf8')
    const fileSize = fs.statSync(routeFile).size
    
    // Vercel serverless function size limit is 50MB uncompressed
    if (fileSize > 1024 * 1024) { // Warn if single file > 1MB
      throw new Error(`Route file ${routeFile} is ${(fileSize / 1024 / 1024).toFixed(2)}MB - may cause issues`)
    }
    
    // Check for problematic imports
    if (content.includes('fs.') && !content.includes('fs/promises')) {
      console.log(`  ⚠️  Warning: ${routeFile} uses sync fs operations`)
    }
    
    // Check for proper exports
    if (!content.includes('export async function') && !content.includes('export const')) {
      throw new Error(`${routeFile} missing proper HTTP method exports`)
    }
  })
  
  console.log(`  ✓ Found ${routeFiles.length} API routes`)
})

// Test 3: Environment Variables
runTest('Environment Variables Check', () => {
  const envExample = fs.readFileSync(path.join(projectRoot, '.env.example'), 'utf8')
  const requiredEnvVars = envExample
    .split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=')[0].trim())
    .filter(v => v)
  
  // Check for client-side env vars
  const clientEnvVars = requiredEnvVars.filter(v => v.startsWith('NEXT_PUBLIC_'))
  const serverEnvVars = requiredEnvVars.filter(v => !v.startsWith('NEXT_PUBLIC_'))
  
  console.log(`  ✓ Found ${clientEnvVars.length} client-side env vars`)
  console.log(`  ✓ Found ${serverEnvVars.length} server-side env vars`)
  
  // Verify no server env vars in client code
  const clientDirs = ['src/app', 'src/components', 'src/hooks']
  clientDirs.forEach(dir => {
    const dirPath = path.join(projectRoot, dir)
    if (fs.existsSync(dirPath)) {
      try {
        const files = runCommand(`find "${dirPath}" -name "*.tsx" -o -name "*.ts" | grep -v api/`).trim().split('\n').filter(Boolean)
        files.forEach(file => {
          if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8')
            serverEnvVars.forEach(envVar => {
              if (content.includes(`process.env.${envVar}`)) {
                throw new Error(`Client file ${file} uses server env var ${envVar}`)
              }
            })
          }
        })
      } catch (error) {
        // Directory exists but no matching files - that's ok
        if (!error.message.includes('Command failed')) {
          throw error
        }
      }
    }
  })
})

// Test 4: Build Test
runTest('Production Build', () => {
  console.log('  🔨 Running production build (this may take a moment)...')
  try {
    runCommand('npm run build')
    console.log('  ✓ Build completed successfully')
  } catch (error) {
    if (error.message.includes('next build')) {
      throw new Error('Build failed - check for TypeScript or ESLint errors')
    }
    throw error
  }
})

// Test 5: Bundle Size Analysis
runTest('Bundle Size Check', () => {
  const buildDir = path.join(projectRoot, '.next')
  if (!fs.existsSync(buildDir)) {
    throw new Error('Build directory not found - run build first')
  }
  
  // Check static assets
  const staticDir = path.join(buildDir, 'static')
  if (fs.existsSync(staticDir)) {
    const jsFiles = runCommand(`find "${staticDir}" -name "*.js" -type f`).trim().split('\n').filter(Boolean)
    let totalSize = 0
    
    jsFiles.forEach(file => {
      const size = fs.statSync(file).size
      totalSize += size
      // Warn for individual chunks > 500KB
      if (size > 500 * 1024) {
        console.log(`  ⚠️  Large chunk: ${path.basename(file)} (${(size / 1024).toFixed(0)}KB)`)
      }
    })
    
    console.log(`  ✓ Total JS bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
  }
})

// Test 6: Edge Runtime Compatibility
runTest('Edge Runtime Compatibility', () => {
  const apiDir = path.join(projectRoot, 'src/app/api')
  const incompatibleAPIs = [
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'fs',
    'http2',
    'net',
    'os',
    'path',
    'perf_hooks',
    'process',
    'stream',
    'tls',
    'v8',
    'vm',
    'worker_threads'
  ]
  
  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Check if using edge runtime
    if (content.includes('runtime = \'edge\'') || content.includes('runtime: \'edge\'')) {
      incompatibleAPIs.forEach(api => {
        if (content.includes(`from '${api}'`) || content.includes(`require('${api}')`)) {
          throw new Error(`Edge runtime route ${filePath} uses incompatible Node.js API: ${api}`)
        }
      })
      console.log(`  ✓ Edge runtime route validated: ${path.relative(projectRoot, filePath)}`)
    }
  }
  
  // Find all route files
  function findRoutes(dir) {
    if (!fs.existsSync(dir)) return
    
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        findRoutes(filePath)
      } else if (file === 'route.ts' || file === 'route.js') {
        checkFile(filePath)
      }
    })
  }
  
  findRoutes(apiDir)
})

// Test 7: Middleware Check
runTest('Middleware Configuration', () => {
  const middlewarePaths = [
    path.join(projectRoot, 'middleware.ts'),
    path.join(projectRoot, 'middleware.js'),
    path.join(projectRoot, 'src/middleware.ts'),
    path.join(projectRoot, 'src/middleware.js')
  ]
  
  const middlewareFile = middlewarePaths.find(p => fs.existsSync(p))
  if (middlewareFile) {
    const content = fs.readFileSync(middlewareFile, 'utf8')
    
    // Check for matcher config
    if (!content.includes('matcher:')) {
      console.log('  ⚠️  Warning: Middleware missing matcher config - will run on all routes')
    }
    
    // Check size (middleware has stricter limits)
    const size = fs.statSync(middlewareFile).size
    if (size > 1024 * 100) { // 100KB
      console.log(`  ⚠️  Warning: Middleware file is ${(size / 1024).toFixed(0)}KB - keep it small`)
    }
    
    console.log(`  ✓ Middleware found at ${path.relative(projectRoot, middlewareFile)}`)
  } else {
    console.log('  ℹ️  No middleware file found')
  }
})

// Test 8: Database Connections
runTest('Database Connection Pooling', () => {
  // Check for connection pooling in database files
  const dbFiles = [
    'src/lib/db/neon-mcp-client.ts',
    'src/lib/db/client.ts',
    'src/lib/auth/tenant-auth.ts'
  ]
  
  dbFiles.forEach(file => {
    const filePath = path.join(projectRoot, file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Check for singleton pattern
      if (!content.includes('static instance') && !content.includes('getInstance')) {
        console.log(`  ⚠️  Warning: ${file} may create multiple DB connections`)
      }
      
      // Check for connection limits
      if (content.includes('new Pool') || content.includes('createPool')) {
        if (!content.includes('max:') && !content.includes('connectionLimit')) {
          console.log(`  ⚠️  Warning: ${file} missing connection pool limits`)
        }
      }
    }
  })
})

// Test 9: Static Asset Optimization
runTest('Static Asset Configuration', () => {
  const publicDir = path.join(projectRoot, 'public')
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir)
    
    // Check for large unoptimized images
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase()
      if (imageExtensions.includes(ext)) {
        const size = fs.statSync(path.join(publicDir, file)).size
        if (size > 500 * 1024) { // 500KB
          console.log(`  ⚠️  Large image: ${file} (${(size / 1024).toFixed(0)}KB) - consider optimization`)
        }
      }
    })
  }
})

// Test 10: Package.json Scripts
runTest('Deployment Scripts', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
  
  const requiredScripts = ['build', 'start']
  requiredScripts.forEach(script => {
    if (!packageJson.scripts[script]) {
      throw new Error(`Missing required script: ${script}`)
    }
  })
  
  // Check for postinstall scripts that might fail in Vercel
  if (packageJson.scripts.postinstall) {
    console.log('  ⚠️  Warning: postinstall script found - ensure it works in Vercel environment')
  }
})

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 VERCEL DEPLOYMENT VALIDATION SUMMARY')
console.log('='.repeat(60))

const passed = results.filter(r => r.status === 'pass').length
const failed = results.filter(r => r.status === 'fail').length
const warnings = results.filter(r => r.status === 'warning').length

results.forEach(result => {
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
  console.log(`${icon} ${result.test}: ${result.message}`)
})

console.log('\n' + '-'.repeat(60))
console.log(`Total: ${results.length} tests`)
console.log(`Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings}`)

if (failed > 0) {
  console.log('\n❌ Deployment validation FAILED - fix the issues above before deploying to Vercel')
  process.exit(1)
} else {
  console.log('\n✅ All tests passed! Your app is ready for Vercel deployment.')
  console.log('\n📝 Next steps:')
  console.log('1. Set up environment variables in Vercel dashboard')
  console.log('2. Connect your GitHub repository')
  console.log('3. Deploy with: vercel --prod')
}