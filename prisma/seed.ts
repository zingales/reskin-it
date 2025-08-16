import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface TokenCardCSVRow {
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

interface DiscoveryCardCSVRow {
  Points: string
  White: string
  Blue: string
  Green: string
  Red: string
  Black: string
}

function parseTokenCardCSV(csvContent: string): TokenCardCSVRow[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  const rows = lines.slice(1)
  
  return rows.map(line => {
    const values = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || ''
    })
    return row as unknown as TokenCardCSVRow
  })
}

function parseDiscoveryCardCSV(csvContent: string): DiscoveryCardCSVRow[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  const rows = lines.slice(1)
  
  return rows.map(line => {
    const values = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || ''
    })
    return row as unknown as DiscoveryCardCSVRow
  })
}

function createCostObject(row: TokenCardCSVRow | DiscoveryCardCSVRow): Record<string, number> {
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
  const csvPath = path.join(__dirname, "card_definitions","token_engine","token_cards.csv")
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const csvRows = parseTokenCardCSV(csvContent)
  
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

async function seedTokenEngineDiscoveryCardDefinitions() {
  console.log('Seeding TokenEngineDiscoveryCardDefinitions from CSV...')
  
  // Read CSV file
  const csvPath = path.join(__dirname, "card_definitions","token_engine","discovery_cards.csv")
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const csvRows = parseDiscoveryCardCSV(csvContent)
  
  // Upsert TokenEngineDiscoveryCardDefinitions from CSV data
  for (const row of csvRows) {
    const costObject = createCostObject(row)
    const points = parseInt(row['Points'] || '0')
    const cost = JSON.stringify(costObject)
    
    // Check if exact record exists (same points AND cost)
    const existing = await prisma.tokenEngineDiscoveryCardDefinition.findFirst({
      where: {
        points,
        cost,
      }
    })

    if (!existing) {
      // Create new record only if it doesn't exist
      await prisma.tokenEngineDiscoveryCardDefinition.create({
        data: {
          points,
          cost,
        }
      })
    }
  }
  
  console.log(`Upserted ${csvRows.length} TokenEngineDiscoveryCardDefinitions from CSV`)
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

  const tokenEngineGameSummary = 'A Engine Game where you use tokens to get token cards which give you discount on a token type and get you points.  Game with similar rules: Splendor'
  const tokenEngineGameRules = `
  # TokenEngine Rules
  ## Overview
  TokenEngine is an engine-building game where players use tokens to acquire resources that generate more tokens and get you points. The first player to get 15 points wins!
  ## Setup
  - Each player starts with 3 tokens of each color
  - Shuffle the card deck and deal 4 cards to each player
  - Setup the field, by having a row for each tier (3 in total) and flipping over 4 cards for each tier. 
  - Also flip over 4 Discovery cards. 
  ## Gameplay
  On your turn, you may either:
    - Take 3 tokens of different colors
    - Take 2 tokens of the same color, if there are 4 or more tokens of that color.
    - Purchase a card using your tokens
    - Reserve a card for later purchase _and_ get a "wild" token.
  
  If you purchase a card, place it in front of you
    - you may purchase a card from the field infront of you. That is less than your tokens + your token cards. 
    - if purchasing this card gets allows you to achieve the requirements of the Discvoery card, you get it. However, you can only get one per turn. 
    - once you have purchased a card, flip another card over from the deck of the equivalent tier.


  ## Victory
  Once a player reaches 15 points, everyone else gets 1 more turn. And the player with the most points wins! Summing points from their token and discovery cards.
  `
  // First, ensure the TokenEngine game exists
  const tokenEngineGame = await prisma.game.upsert({
    where: { name: 'TokenEngine' },
    update: {
      summary: tokenEngineGameSummary,
      rules: tokenEngineGameRules
    },
    create: {
      name: 'TokenEngine',
      summary: tokenEngineGameSummary,
      rules: tokenEngineGameRules
    }
  })

  console.log('✅ TokenEngine game upserted')

  // Create GameCardDefinition for TokenEngine
  const tokenEngineCardDefinitionDescription = 'Cards that can be purchased with tokens to build your engine'
  const tokenEngineCardDefinitionTableName = 'TokenEngineCardDefinition'
  const tokenEngineCardDefinitionName = 'Token Cards'

  await prisma.gameCardDefinition.upsert({
    where: {
      gameId_name: {
        gameId: tokenEngineGame.id,
        name: tokenEngineCardDefinitionName
      }
    },
    update: {
      description: tokenEngineCardDefinitionDescription,
      tableName: tokenEngineCardDefinitionTableName
    },
    create: {
      gameId: tokenEngineGame.id,
      name: tokenEngineCardDefinitionName,
      description: tokenEngineCardDefinitionDescription,
      tableName: tokenEngineCardDefinitionTableName
    }
  })

  console.log('✅ TokenEngine card definition table upserted')

  // Create GameCardDefinition for TokenEngine Discovery Cards
  const tokenEngineDiscoveryCardDefinitionDescription = 'Discovery cards that provide victory points when enough token cards are met'
  const tokenEngineDiscoveryCardDefinitionTableName = 'TokenEngineDiscoveryCardDefinition'
  const tokenEngineDiscoveryCardDefinitionName = 'Discovery Cards'

  await prisma.gameCardDefinition.upsert({
    where: {
      gameId_name: {
        gameId: tokenEngineGame.id,
        name: tokenEngineDiscoveryCardDefinitionName
      }
    },
    update: {
      description: tokenEngineDiscoveryCardDefinitionDescription,
      tableName: tokenEngineDiscoveryCardDefinitionTableName
    },
    create: {
      gameId: tokenEngineGame.id,
      name: tokenEngineDiscoveryCardDefinitionName,
      description: tokenEngineDiscoveryCardDefinitionDescription,
      tableName: tokenEngineDiscoveryCardDefinitionTableName
    }
  })

  console.log('✅ TokenEngine discovery card definition table upserted')

  // Create a single card set with two decks
  const tokenEngineCardSet = await prisma.cardSet.upsert({
    where: { 
      title_userId: {
        title: "TokenEngine Example Deck",
        userId: testUser.id
      }
    },
    update: {
      description: "A complete TokenEngine starter set with token cards and discovery cards",
      imageUrl: "https://placehold.co/300x200/667eea/FFFFFF?text=TokenEngine",
      gameId: tokenEngineGame.id,
    },
    create: {
      title: "TokenEngine Starter Set",
      description: "A complete TokenEngine starter set with token cards and discovery cards",
      imageUrl: "https://placehold.co/300x200/667eea/FFFFFF?text=TokenEngine",
      gameId: tokenEngineGame.id,
      userId: testUser.id
    },
  })

  console.log('✅ TokenEngine starter card set upserted')

  // Get the GameCardDefinition IDs
  const tokenCardDefinition = await prisma.gameCardDefinition.findFirst({
    where: {
      gameId: tokenEngineGame.id,
      name: tokenEngineCardDefinitionName
    }
  })

  const discoveryCardDefinition = await prisma.gameCardDefinition.findFirst({
    where: {
      gameId: tokenEngineGame.id,
      name: tokenEngineDiscoveryCardDefinitionName
    }
  })

  if (!tokenCardDefinition || !discoveryCardDefinition) {
    throw new Error('GameCardDefinitions not found')
  }

  // Get the card definition IDs for creating decks
  const tokenCards = await prisma.tokenEngineCardDefinition.findMany({
    select: { id: true, tier: true }
  })
  const discoveryCards = await prisma.tokenEngineDiscoveryCardDefinition.findMany({
    select: { id: true }
  })

  // Create Discovery Cards deck (all discovery cards)
  const discoveryCardsDeck = await prisma.deck.upsert({
    where: {
      name_cardSetId: {
        name: "Discovery Cards",
        cardSetId: tokenEngineCardSet.id
      }
    },
    update: {
      description: "All discovery cards that provide victory points when requirements are met",
      gameCardDefinitionId: discoveryCardDefinition.id,
      cardDefinitionIds: discoveryCards.map(card => card.id)
    },
    create: {
      name: "Discovery Cards",
      description: "All discovery cards that provide victory points when requirements are met",
      cardSetId: tokenEngineCardSet.id,
      gameCardDefinitionId: discoveryCardDefinition.id,
      cardDefinitionIds: discoveryCards.map(card => card.id)
    }
  })

  // Create Tier 1 Token Cards deck
  const tier1TokenCards = tokenCards.filter(card => card.tier === 1)
  const tier1Deck = await prisma.deck.upsert({
    where: {
      name_cardSetId: {
        name: "Tier 1 Token Cards",
        cardSetId: tokenEngineCardSet.id
      }
    },
    update: {
      description: "All Tier 1 token cards for building your engine",
      gameCardDefinitionId: tokenCardDefinition.id,
      cardDefinitionIds: tier1TokenCards.map(card => card.id)
    },
    create: {
      name: "Tier 1 Token Cards",
      description: "All Tier 1 token cards for building your engine",
      cardSetId: tokenEngineCardSet.id,
      gameCardDefinitionId: tokenCardDefinition.id,
      cardDefinitionIds: tier1TokenCards.map(card => card.id)
    }
  })

  // Create Tier 2 Token Cards deck
  const tier2TokenCards = tokenCards.filter(card => card.tier === 2)
  const tier2Deck = await prisma.deck.upsert({
    where: {
      name_cardSetId: {
        name: "Tier 2 Token Cards",
        cardSetId: tokenEngineCardSet.id
      }
    },
    update: {
      description: "All Tier 2 token cards for building your engine",
      gameCardDefinitionId: tokenCardDefinition.id,
      cardDefinitionIds: tier2TokenCards.map(card => card.id)
    },
    create: {
      name: "Tier 2 Token Cards",
      description: "All Tier 2 token cards for building your engine",
      cardSetId: tokenEngineCardSet.id,
      gameCardDefinitionId: tokenCardDefinition.id,
      cardDefinitionIds: tier2TokenCards.map(card => card.id)
    }
  })

  // Create Tier 3 Token Cards deck
  const tier3TokenCards = tokenCards.filter(card => card.tier === 3)
  const tier3Deck = await prisma.deck.upsert({
    where: {
      name_cardSetId: {
        name: "Tier 3 Token Cards",
        cardSetId: tokenEngineCardSet.id
      }
    },
    update: {
      description: "All Tier 3 token cards for building your engine",
      gameCardDefinitionId: tokenCardDefinition.id,
      cardDefinitionIds: tier3TokenCards.map(card => card.id)
    },
    create: {
      name: "Tier 3 Token Cards",
      description: "All Tier 3 token cards for building your engine",
      cardSetId: tokenEngineCardSet.id,
      gameCardDefinitionId: tokenCardDefinition.id,
      cardDefinitionIds: tier3TokenCards.map(card => card.id)
    }
  })

  console.log('✅ TokenEngine decks created: Discovery Cards, Tier 1, Tier 2, and Tier 3 Token Cards')

  // Seed TokenEngineCardDefinitions from CSV
  await seedTokenEngineCardDefinitions()
  await seedTokenEngineDiscoveryCardDefinitions()

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
