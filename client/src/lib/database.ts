import { PrismaClient } from '@prisma/client'
import type { CardSet } from '../types/CardSet'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getAllCardSets(): Promise<CardSet[]> {
  try {
    const cardSets = await prisma.cardSet.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return cardSets as CardSet[]
  } catch (error) {
    console.error('Error fetching card sets:', error)
    throw error
  }
}

export async function createCardSet(data: Omit<CardSet, 'id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<CardSet> {
  try {
    const cardSet = await prisma.cardSet.create({
      data,
      include: {
        user: true
      }
    })
    return cardSet as CardSet
  } catch (error) {
    console.error('Error creating card set:', error)
    throw error
  }
}

export async function getCardSetById(id: number): Promise<CardSet | null> {
  try {
    const cardSet = await prisma.cardSet.findUnique({
      where: { id },
      include: {
        user: true
      }
    })
    return cardSet as CardSet | null
  } catch (error) {
    console.error('Error fetching card set:', error)
    throw error
  }
}
