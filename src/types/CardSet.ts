export interface User {
  id: number
  username: string
  email: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CardSet {
  id: number
  title: string
  description: string
  imageUrl: string
  category: string
  userId: number
  user: User
  createdAt: string
  updatedAt: string
}

// For when we need to fetch a user with their card sets
export interface UserWithCardSets extends User {
  cardSets: CardSet[]
}
