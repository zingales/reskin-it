import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
}
