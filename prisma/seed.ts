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
  
  // Clear existing TokenEngineCardDefinitions
  await prisma.tokenEngineCardDefinition.deleteMany()
  
  // Create TokenEngineCardDefinitions from CSV data
  for (const row of csvRows) {
    const costObject = createCostObject(row)
    
    await prisma.tokenEngineCardDefinition.create({
      data: {
        token: row.token.toUpperCase() as 'WHITE' | 'BLUE' | 'GREEN' | 'RED' | 'BLACK',
        points: parseInt(row.points),
        tier: parseInt(row.tier),
        cost: JSON.stringify(costObject),
      },
    })
  }
  
  console.log(`Created ${csvRows.length} TokenEngineCardDefinitions from CSV`)
}

async function main() {
  // Clear existing data
  await prisma.cardSet.deleteMany()

  // Seed with initial CardSet data
  const cardSets = [
    {
      title: "Modern UI Components",
      description: "A collection of modern, responsive UI components built with React and Chakra UI",
      imageUrl: "https://placehold.co/300x200/4299E1/FFFFFF?text=UI+Components",
      category: "UI/UX",
    },
    {
      title: "E-commerce Templates",
      description: "Complete e-commerce website templates with shopping cart functionality",
      imageUrl: "https://placehold.co/300x200/48BB78/FFFFFF?text=E-commerce",
      category: "E-commerce",
    },
    {
      title: "Dashboard Layouts",
      description: "Professional dashboard layouts with charts, tables, and analytics",
      imageUrl: "https://placehold.co/300x200/ED8936/FFFFFF?text=Dashboard",
      category: "Dashboard",
    },
    {
      title: "Mobile App Templates",
      description: "Cross-platform mobile app templates with native-like performance",
      imageUrl: "https://placehold.co/300x200/9F7AEA/FFFFFF?text=Mobile+App",
      category: "Mobile",
    },
    {
      title: "Landing Page Designs",
      description: "High-converting landing page templates for various industries",
      imageUrl: "https://placehold.co/300x200/F56565/FFFFFF?text=Landing+Page",
      category: "Marketing",
    },
    {
      title: "Admin Panels",
      description: "Feature-rich admin panel templates with user management",
      imageUrl: "https://placehold.co/300x200/38B2AC/FFFFFF?text=Admin+Panel",
      category: "Admin",
    },
  ]

  for (const cardSet of cardSets) {
    await prisma.cardSet.create({
      data: cardSet,
    })
  }

  // Seed TokenEngineCardDefinitions from CSV
  await seedTokenEngineCardDefinitions()

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
