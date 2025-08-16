import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface TokenEngineCSVRow {
  tier: string
  points: string
  token: string
  White: string
  Blue: string
  Green: string
  Red: string
  Black: string
  extra: string
}

function parseCSV(csvContent: string): TokenEngineCSVRow[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  const rows = lines.slice(1)
  
  return rows.map(line => {
    const values = line.split(',')
    const row: any = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || ''
    })
    return row as TokenEngineCSVRow
  })
}

function createCostObject(row: TokenEngineCSVRow): Record<string, number> {
  return {
    WHITE: parseInt(row.White) || 0,
    BLUE: parseInt(row.Blue) || 0,
    GREEN: parseInt(row.Green) || 0,
    RED: parseInt(row.Red) || 0,
    BLACK: parseInt(row.Black) || 0,
  }
}

async function seedTokenEngineCardDefinitions() {
  console.log('Seeding TokenEngineCardDefinitions from CSV...')
  
  // Read CSV file
  const csvPath = path.join(__dirname, 'resourceCards.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const csvRows = parseCSV(csvContent)
  
  // Upsert TokenEngineCardDefinitions from CSV data
  for (const row of csvRows) {
    const costObject = createCostObject(row)
    const token = row.token.toUpperCase() as 'WHITE' | 'BLUE' | 'GREEN' | 'RED' | 'BLACK'
    const points = parseInt(row.points)
    const tier = parseInt(row.tier)
    const cost = JSON.stringify(costObject)
    
    // Check if exact record exists (same token, tier, points, AND cost)
    const existing = await prisma.tokenEngineCardDefinition.findFirst({
      where: {
        token,
        tier,
        points,
        cost,
      }
    })

    if (!existing) {
      // Create new record only if it doesn't exist
      await prisma.tokenEngineCardDefinition.create({
        data: {
          token,
          points,
          tier,
          cost,
        }
      })
    }
  }
  
  console.log(`Upserted ${csvRows.length} TokenEngineCardDefinitions from CSV`)
}

async function main() {
  console.log('Starting database seeding with upserts...')

  // Upsert the system default user
  const testUser = await prisma.user.upsert({
    where: { username: 'SystemDefault' },
    update: {
      email: 'reskinit.default@zingales.org',
      displayName: 'System Default',
      bio: 'System default, to show the default card sets.',
      avatarUrl: 'https://placehold.co/100x100/667eea/FFFFFF?text=DU'
    },
    create: {
      username: 'SystemDefault',
      email: 'reskinit.default@zingales.org',
      password: 'hashed_password_here', // In production, this should be properly hashed
      displayName: 'System Default',
      bio: 'System default, to show the default card sets.',
      avatarUrl: 'https://placehold.co/100x100/667eea/FFFFFF?text=DU'
    }
  })

  console.log('✅ System default user upserted')

  // First, ensure the TokenEngine game exists
  const tokenEngineGame = await prisma.game.upsert({
    where: { name: 'TokenEngine' },
    update: {
      summary: 'A Engine Game where you use tokens to get resources which generate more tokens. Game with similar rules: Splendor',
      rules: '# TokenEngine Rules\n\n## Overview\nTokenEngine is an engine-building game where players use tokens to acquire resources that generate more tokens.\n\n## Setup\n- Each player starts with 3 tokens of each color\n- Shuffle the card deck and deal 4 cards to each player\n\n## Gameplay\n1. On your turn, you may either:\n   - Take 3 tokens of different colors\n   - Take 2 tokens of the same color (if available)\n   - Purchase a card using your tokens\n\n2. When you purchase a card, place it in front of you\n3. Cards provide ongoing benefits and victory points\n\n## Victory\n- The game ends when a player reaches 15 victory points\n- The player with the most points wins!',
      cardDefinitionTable: 'TokenEngineCardDefinition'
    },
    create: {
      name: 'TokenEngine',
      summary: 'A Engine Game where you use tokens to get resources which generate more tokens. Game with similar rules: Splendor',
      rules: '# TokenEngine Rules\n\n## Overview\nTokenEngine is an engine-building game where players use tokens to acquire resources that generate more tokens.\n\n## Setup\n- Each player starts with 3 tokens of each color\n- Shuffle the card deck and deal 4 cards to each player\n\n## Gameplay\n1. On your turn, you may either:\n   - Take 3 tokens of different colors\n   - Take 2 tokens of the same color (if available)\n   - Purchase a card using your tokens\n\n2. When you purchase a card, place it in front of you\n3. Cards provide ongoing benefits and victory points\n\n## Victory\n- The game ends when a player reaches 15 victory points\n- The player with the most points wins!',
      cardDefinitionTable: 'TokenEngineCardDefinition'
    }
  })

  console.log('✅ TokenEngine game upserted')

  // Seed with initial CardSet data using upserts
  const cardSets = [
    {
      title: "Modern UI Components",
      description: "A collection of modern, responsive UI components built with React and Chakra UI",
      imageUrl: "https://placehold.co/300x200/4299E1/FFFFFF?text=UI+Components",
      gameId: tokenEngineGame.id,
    },
    {
      title: "E-commerce Templates",
      description: "Complete e-commerce website templates with shopping cart functionality",
      imageUrl: "https://placehold.co/300x200/48BB78/FFFFFF?text=E-commerce",
      gameId: tokenEngineGame.id,
    },
    {
      title: "Dashboard Layouts",
      description: "Professional dashboard layouts with charts, tables, and analytics",
      imageUrl: "https://placehold.co/300x200/ED8936/FFFFFF?text=Dashboard",
      gameId: tokenEngineGame.id,
    },
    {
      title: "Mobile App Templates",
      description: "Cross-platform mobile app templates with native-like performance",
      imageUrl: "https://placehold.co/300x200/9F7AEA/FFFFFF?text=Mobile+App",
      gameId: tokenEngineGame.id,
    },
    {
      title: "Landing Page Designs",
      description: "High-converting landing page templates for various industries",
      imageUrl: "https://placehold.co/300x200/F56565/FFFFFF?text=Landing+Page",
      gameId: tokenEngineGame.id,
    },
    {
      title: "Admin Panels",
      description: "Feature-rich admin panel templates with user management",
      imageUrl: "https://placehold.co/300x200/38B2AC/FFFFFF?text=Admin+Panel",
      gameId: tokenEngineGame.id,
    },
  ]

  // Upsert card sets (using title as unique identifier)
  for (const cardSet of cardSets) {
    await prisma.cardSet.upsert({
      where: { 
        title_userId: {
          title: cardSet.title,
          userId: testUser.id
        }
      },
      update: {
        description: cardSet.description,
        imageUrl: cardSet.imageUrl,
        gameId: cardSet.gameId,
      },
      create: {
        ...cardSet,
        userId: testUser.id
      },
    })
  }

  console.log('✅ Default card sets upserted')

  // Seed TokenEngineCardDefinitions from CSV
  await seedTokenEngineCardDefinitions()

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
