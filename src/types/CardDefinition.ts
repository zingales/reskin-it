// Generic CardProperty type
export interface CardDefinition {
  id: number
  cardSetId: number
  createdAt: string
  updatedAt: string
}

export const TokenType = {
    WHITE: 'WHITE',
    BLUE: 'BLUE',
    GREEN: 'GREEN',
    RED: 'RED',
    BLACK: 'BLACK'
} as const

export type TokenType = typeof TokenType[keyof typeof TokenType]

// SplendorCardProperty type that extends CardProperty
export interface TokenEngineCardDefinition extends CardDefinition {
  token: TokenType
  points: number
  tier: number
  cost: Map<TokenType, number>
}

// TokenEngineDiscoveryCardDefinition type for discovery cards
export interface TokenEngineDiscoveryCardDefinition extends CardDefinition {
  points: number
  cost: Map<TokenType, number>
}
