import express from 'express'
import cors from 'cors'

// Import all API handlers
import healthHandler from '../api/health/index.js'
import dbInfoHandler from '../api/debug/db-info.js'
import cardsetsHandler from '../api/cardsets/index.js'
import cardSetByIdHandler from '../api/cardsets/[id].js'
import userCardSetsHandler from '../api/cardsets/user/me.js'
import cardDefinitionsHandler from '../api/card-definitions/index.js'
import registerHandler from '../api/auth/register.js'
import loginHandler from '../api/auth/login.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Route handlers
app.get('/api/health', healthHandler)
app.get('/api/debug/db-info', dbInfoHandler)
app.get('/api/cardsets', cardsetsHandler)
app.get('/api/cardsets/:id', cardSetByIdHandler)
app.get('/api/cardsets/user/me', userCardSetsHandler)
app.get('/api/card-definitions', cardDefinitionsHandler)
app.post('/api/auth/register', registerHandler)
app.post('/api/auth/login', loginHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Local development server running on http://localhost:${PORT}`)
})
