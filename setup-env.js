#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🚀 OrgoGPT Environment Setup')
console.log('=============================\n')

const envPath = path.join(__dirname, '.env.local')

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!')
  console.log('Please check your API keys are correct.\n')
} else {
  const envContent = `# Orgo API Key - Get one from https://docs.orgo.ai/quickstart
ORGO_API_KEY=your_orgo_api_key_here

# Anthropic API Key - Get one from https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# API Base URL (optional - defaults to /api/orgo)
NEXT_PUBLIC_API_URL=/api/orgo
`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file')
  console.log('📝 Please update the API keys in .env.local with your actual keys\n')
}

console.log('📋 Next Steps:')
console.log('1. Get your Orgo API key from: https://docs.orgo.ai/quickstart')
console.log('2. Get your Anthropic API key from: https://console.anthropic.com/')
console.log('3. Update the .env.local file with your actual API keys')
console.log('4. Run: npm run dev')
console.log('\n🎉 Happy coding!') 