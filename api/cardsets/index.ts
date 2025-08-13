import { getAllCardSets } from '../../src/lib/database'

export default async function handler(req: any, res: any) {
  try {
    const cardSets = await getAllCardSets()
    res.json(cardSets)
  } catch (error) {
    console.error('Error fetching card sets:', error)
    res.status(500).json({ error: 'Failed to fetch card sets' })
  }
}
