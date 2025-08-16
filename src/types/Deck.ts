import type { CardSet } from './CardSet'
import type { GameCardDefinition } from './Game'

export interface Deck {
  id: number
  name: string
  description: string | null
  cardSetId: number
  cardSet: CardSet // Optional relation
  gameCardDefinitionId: number
  gameCardDefinition: GameCardDefinition // Optional relation
  cardDefinitionIds: number[] // Array of row IDs from the specific card definition table
  createdAt: Date
  updatedAt: Date
}

// For when we need to fetch a card set with its decks
export interface CardSetWithDecks extends CardSet {
  decks: Deck[]
}

// For when we need to fetch a deck with its relations
export interface DeckWithRelations extends Deck {
  cardSet: CardSet
  gameCardDefinition: GameCardDefinition
}
