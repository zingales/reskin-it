export interface User {
  id: number
  username: string
  email: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CardSet {
  id: number
  title: string
  description: string
  imageUrl: string
  category: string
  userId: number
  user: User
  createdAt: Date
  updatedAt: Date
}

// For when we need to fetch a user with their card sets
export interface UserWithCardSets extends User {
  cardSets: CardSet[]
}
