import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAllCardSets } from '../../src/lib/database'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const cardSets = await getAllCardSets()
    res.json(cardSets)
  } catch (error) {
    console.error('Error fetching card sets:', error)
    res.status(500).json({ error: 'Failed to fetch card sets' })
  }
}
