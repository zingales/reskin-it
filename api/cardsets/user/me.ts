import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: () => void) => {
  const authHeader = req.headers.authorization
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
    ;(req as any).user = user
    next()
  })
}

export default async function handler(req: any, res: any) {
  // Apply authentication middleware
  authenticateToken(req, res, async () => {
    try {
      const userId = (req as any).user.userId
      
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
}
