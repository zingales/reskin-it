import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: any, res: any) {
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
}
