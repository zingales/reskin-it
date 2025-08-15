#!/usr/bin/env node

console.log('=== ENVIRONMENT VARIABLES DEBUG ===')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL}...` : 'NOT SET')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VERCEL_ENV:', process.env.VERCEL_ENV)
console.log('VERCEL_URL:', process.env.VERCEL_URL)
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('VERCEL') || key.includes('NODE')))
console.log('=== END DEBUG ===')
