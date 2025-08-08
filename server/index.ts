import express from 'express'
import cors from 'cors'
import { getAllCardSets, createCardSet, getCardSetById } from '../src/lib/database'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

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

app.post('/api/cardsets', async (req, res) => {
  try {
    const { title, description, imageUrl, category } = req.body
    
    if (!title || !description || !imageUrl || !category) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const cardSet = await createCardSet({
      title,
      description,
      imageUrl,
      category
    })
    
    res.status(201).json(cardSet)
  } catch (error) {
    console.error('Error creating card set:', error)
    res.status(500).json({ error: 'Failed to create card set' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
