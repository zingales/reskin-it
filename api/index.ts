import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getAllCardSets, createCardSet, getCardSetById } from '../src/lib/database'
import { PrismaClient } from '@prisma/client'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
      };
    }
  }
}

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET
const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json())

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET is not set' })
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
app.get('/api/cardsets', async (req, res) => {
  try {
    const cardSets = await getAllCardSets()
    res.json(cardSets)
  } catch (error) {
    console.error('Error fetching card sets:', error)
    res.status(500).json({ error: 'Failed to fetch card sets' })
  }
})

// Get card sets for authenticated user
app.get('/api/cardsets/user/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.userId
    
    const userCardSets = await prisma.cardSet.findMany({
      where: { userId },
      include: {
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
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(userCardSets)
  } catch (error) {
    console.error('Error fetching user card sets:', error)
    res.status(500).json({ error: 'Failed to fetch user card sets' })
  }
})

app.get('/api/cardsets/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const cardSet = await getCardSetById(id)
    
    if (!cardSet) {
      return res.status(404).json({ error: 'Card set not found' })
    }
    
    res.json(cardSet)
  } catch (error) {
    console.error('Error fetching card set:', error)
    res.status(500).json({ error: 'Failed to fetch card set' })
  }
})

app.post('/api/cardsets', authenticateToken, async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body
    
    if (!title || !description || !imageUrl || !category) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const userId = req.user!.userId

    const cardSet = await createCardSet({
      title,
      description,
      imageUrl,
      category,
      userId
    })

    res.status(201).json(cardSet)
  } catch (error) {
    console.error('Error creating card set:', error)
    res.status(500).json({ error: 'Failed to create card set' })
  }
})

// Card Definitions endpoint
app.get('/api/card-definitions', async (req, res) => {
  try {
    const cardDefinitions = await prisma.tokenEngineCardDefinition.findMany({
      orderBy: [
        { tier: 'asc' },
        { points: 'desc' },
        { token: 'asc' }
      ]
    })
    
    // Transform the cost from JSON string to Map-like object
    const transformedDefinitions = cardDefinitions.map(card => ({
      ...card,
      cost: card.cost // Keep as string, will be parsed on frontend
    }))
    
    res.json(transformedDefinitions)
  } catch (error) {
    console.error('Error fetching card definitions:', error)
    res.status(500).json({ error: 'Failed to fetch card definitions' })
  }
})

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
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

    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not set' })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user
    res.status(201).json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ error: 'Failed to register user' })
  }
})

app.post('/api/auth/login', async (req, res) => {
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
    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not set' })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user
    res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Error logging in:', error)
    res.status(500).json({ error: 'Failed to log in' })
  }
})

// Protected route example
app.get('/api/auth/me', authenticateToken, async (req, res) => {
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
    
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Database info endpoint
app.get('/api/debug/db-info', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'not set'
    const isPostgres = dbUrl.includes('postgresql://')
    const isSqlite = dbUrl.includes('file:')
    
    // Test database connection
    let dbTest = 'Not tested'
    try {
      await prisma.$queryRaw`SELECT 1`
      dbTest = 'Connected successfully'
    } catch (error) {
      dbTest = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    res.json({
      databaseUrl: isPostgres ? 'postgresql://***' : dbUrl,
      provider: isPostgres ? 'PostgreSQL' : isSqlite ? 'SQLite' : 'Unknown',
      isProduction: process.env.NODE_ENV === 'production',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseTest: dbTest,
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get database info' })
  }
})

// For Vercel serverless functions, export the app
export default app

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}
