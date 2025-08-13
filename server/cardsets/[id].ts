import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCardSetById } from '../../src/lib/database'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = parseInt(req.query.id as string)
    const cardSet = await getCardSetById(id)
    
    if (!cardSet) {
      return res.status(404).json({ error: 'Card set not found' })
    }
    
    res.json(cardSet)
  } catch (error) {
    console.error('Error fetching card set:', error)
    res.status(500).json({ error: 'Failed to fetch card set' })
  }
}
