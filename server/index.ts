import express from 'express'
import cors from 'cors'

// Import all API handlers
import healthHandler from './health/index.js'
import dbInfoHandler from './debug/db-info.js'
import cardsetsHandler from './cardsets/index.js'
import cardSetByIdHandler from './cardsets/[id].js'
import userCardSetsHandler from './cardsets/user/me.js'
import cardDefinitionsHandler from './card-definitions/index.js'
import registerHandler from './auth/register.js'
import loginHandler from './auth/login.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Route handlers - wrap Vercel handlers for Express compatibility
app.get('/api/health', (req, res) => healthHandler(req as any, res as any))
app.get('/api/debug/db-info', (req, res) => dbInfoHandler(req as any, res as any))
app.get('/api/cardsets', (req, res) => cardsetsHandler(req as any, res as any))
app.get('/api/cardsets/:id', (req, res) => cardSetByIdHandler(req as any, res as any))
app.get('/api/cardsets/user/me', (req, res) => userCardSetsHandler(req as any, res as any))
app.get('/api/card-definitions', (req, res) => cardDefinitionsHandler(req as any, res as any))
app.post('/api/auth/register', (req, res) => registerHandler(req as any, res as any))
app.post('/api/auth/login', (req, res) => loginHandler(req as any, res as any))

// Start server
app.listen(PORT, () => {
  console.log(`Local development server running on http://localhost:${PORT}`)
})
