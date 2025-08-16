// Load environment variables from .env file
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

// Prisma client initialization for serverless environments
let prisma: any

// Cache the Prisma client instance for serverless environments
if (process.env.NODE_ENV === 'production') {
  // In production (Vercel), use a cached instance
  if (!(global as any).__prisma) {
    (global as any).__prisma = new PrismaClient()
  }
  prisma = (global as any).__prisma
} else {
  // In development, create a new instance
  prisma = new PrismaClient()
}

async function getAllGames() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return games
  } catch (error) {
    console.error('Error fetching games:', error)
    throw error
  }
}

async function getGameById(id: number) {
  try {
    const game = await prisma.game.findUnique({
      where: { id }
    })
    return game
  } catch (error) {
    console.error('Error fetching game:', error)
    throw error
  }
}

async function getAllCardSets(includeOptions?: string[]) {
  try {
    const include: any = {}
    
    // Parse include options
    if (includeOptions) {
      if (includeOptions.includes('user')) {
        include.user = true
      }
      if (includeOptions.includes('game')) {
        include.game = true
      }
    } else {
      // Default behavior: include both
      include.user = true
      include.game = true
    }
    
    const cardSets = await prisma.cardSet.findMany({
      include,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return cardSets
  } catch (error) {
    console.error('Error fetching card sets:', error)
    throw error
  }
}

async function createCardSet(data: any) {
  try {
    const cardSet = await prisma.cardSet.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        gameId: parseInt(data.gameId, 10),
        userId: data.userId
      },
      include: {
        user: true,
        game: true
      }
    })
    return cardSet
  } catch (error) {
    console.error('Error creating card set:', error)
    throw error
  }
}

async function getCardSetById(id: number) {
  try {
    const cardSet = await prisma.cardSet.findUnique({
      where: { id },
      include: {
        user: true,
        game: true
      }
    })
    return cardSet
  } catch (error) {
    console.error('Error fetching card set:', error)
    throw error
  }
}

// Note: In CommonJS, we can't use global type declarations
// We'll handle req.user typing with 'any' types

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://reskin-it.vercel.app'] 
    : ['http://localhost:5173'],
  credentials: true
}))
app.use(express.json())

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Routes
app.get('/api/games', async (_req: any, res: any) => {
  try {
    const games = await getAllGames()
    res.json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({ error: 'Failed to fetch games' })
  }
})

app.get('/api/games/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id, 10)
    const game = await getGameById(id)
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }
    
    return res.json(game)
  } catch (error) {
    console.error('Error fetching game:', error)
    return res.status(500).json({ error: 'Failed to fetch game' })
  }
})

app.get('/api/cardsets', async (req: any, res: any) => {
  try {
    // Parse include parameter: ?include=game,user or ?include=game
    const includeParam = req.query.include as string
    const includeOptions = includeParam ? includeParam.split(',') : undefined
    
    const cardSets = await getAllCardSets(includeOptions)
    res.json(cardSets)
  } catch (error) {
    console.error('Error fetching card sets:', error)
    res.status(500).json({ error: 'Failed to fetch card sets' })
  }
})

// Get card sets for authenticated user
app.get('/api/cardsets/user/me', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user!.userId
    
    // Parse include parameter: ?include=game,user or ?include=game
    const includeParam = req.query.include as string
    const includeOptions = includeParam ? includeParam.split(',') : undefined
    
    const include: any = {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
    
    // Include game relation if specified or default behavior
    if (!includeOptions || includeOptions.includes('game')) {
      include.game = true
    }
    
    const userCardSets = await prisma.cardSet.findMany({
      where: { userId },
      include,
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(userCardSets)
  } catch (error) {
    console.error('Error fetching user card sets:', error)
    res.status(500).json({ error: 'Failed to fetch user card sets' })
  }
})

app.get('/api/cardsets/:id', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id, 10)
    const cardSet = await getCardSetById(id)
    
    if (!cardSet) {
      return res.status(404).json({ error: 'Card set not found' })
    }
    
    return res.json(cardSet)
  } catch (error) {
    console.error('Error fetching card set:', error)
    return res.status(500).json({ error: 'Failed to fetch card set' })
  }
})

app.post('/api/cardsets', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, description, imageUrl, gameId } = req.body
    
    if (!title || !description || !imageUrl || !gameId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const userId = req.user!.userId

    const cardSet = await createCardSet({
      title,
      description,
      imageUrl,
      gameId,
      userId
    })

    return res.status(201).json(cardSet)
  } catch (error) {
    console.error('Error creating card set:', error)
    return res.status(500).json({ error: 'Failed to create card set' })
  }
})

// Card Definitions endpoint
app.get('/api/card-definitions', async (_req: any, res: any) => {
  try {
    const cardDefinitions = await prisma.tokenEngineCardDefinition.findMany({
      orderBy: [
        { tier: 'asc' },
        { points: 'desc' },
        { token: 'asc' }
      ]
    })
    
    // Transform the cost from JSON string to Map-like object
    const transformedDefinitions = cardDefinitions.map((card: typeof cardDefinitions[0]) => ({
      ...card,
      cost: card.cost // Keep as string, will be parsed on frontend
    }))
    
    return res.json(transformedDefinitions)
  } catch (error) {
    console.error('Error fetching card definitions:', error)
    return res.status(500).json({ error: 'Failed to fetch card definitions' })
  }
})

// Authentication endpoints
app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { username, email, password, displayName } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' })
    }
    
    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        displayName: displayName || username
      }
    })
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user
    return res.status(201).json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return res.status(500).json({ error: 'Failed to register user' })
  }
})

app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    
    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    })
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user
    return res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error logging in:', error)
    return res.status(500).json({ error: 'Failed to log in' })
  }
})

// Protected route example
app.get('/api/auth/me', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    return res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Health check
app.get('/api/health', (_req: any, res: any) => {
  return res.json({ status: 'OK', message: 'Server is running' })
})

// For Vercel deployment
// Because of typing mismatch we can't add the types. But the following types are:
// req: VercelRequest, res: VercelResponse
module.exports = function handler(req: any, res: any) {
  return app(req, res)
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}
