import type { Deck } from './Deck'

export interface GameCardDefinition {
  id: number
  gameId: number
  name: string
  description: string
  tableName: string
  decks?: Deck[] // Optional relation
  createdAt: Date
  updatedAt: Date
}

export interface Game {
  id: number
  name: string
  summary: string
  rules: string
  cardDefinitionTables: GameCardDefinition[]
  createdAt: Date
  updatedAt: Date
}
