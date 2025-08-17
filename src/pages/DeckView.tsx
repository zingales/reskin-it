import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Spinner,
  Center,
  Button,
  Flex
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import { toaster } from '../components/ui/toaster'
import TokenEngineCardDefinitionViewer from '../components/CardDefinitionViewer'
import DiscoveryCardDefinitionViewer from '../components/DiscoveryCardDefinitionViewer'
import type { Deck } from '../types/Deck'
import type { GameCardDefinition } from '../types/Game'
import type { TokenEngineCardDefinition, TokenEngineDiscoveryCardDefinition } from '../types/CardDefinition'

// Type for Deck with guaranteed non-null relations
type DeckWithRelations = Omit<Deck, 'cardSet' | 'gameCardDefinition'> & { 
  cardSet: {
    id: number
    title: string
    description: string
    imageUrl: string
    game: {
      id: number
      name: string
    }
    user: {
      id: number
      username: string
      displayName: string | null
    }
  }
  gameCardDefinition: GameCardDefinition
}

export default function DeckView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<DeckWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cardDefinitions, setCardDefinitions] = useState<TokenEngineCardDefinition[] | TokenEngineDiscoveryCardDefinition[]>([])
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([])
  const { user } = useAuth()

  // Set page title
  useEffect(() => {
    document.title = deck ? `${deck.name} - Deck` : 'Deck'
  }, [deck])

  useEffect(() => {
    const fetchDeck = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/decks/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Deck not found')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setDeck(data as DeckWithRelations)
        
        // Ensure unique IDs by using Set
        const uniqueIds = [...new Set((data.cardDefinitionIds || []) as number[])]
        
        setSelectedCardIds(uniqueIds)
        
        // Fetch card definitions based on the game card definition type
        if (data.gameCardDefinition?.tableName) {
          const cardDefsResponse = await fetch(`/api/card-definitions/${data.gameCardDefinition.tableName}`)
          if (cardDefsResponse.ok) {
            const cardDefs = await cardDefsResponse.json()
            setCardDefinitions(cardDefs)
          }
        }
      } catch (err) {
        console.error('Error fetching deck:', err)
        setError(err instanceof Error ? err.message : 'Failed to load deck')
      } finally {
        setLoading(false)
      }
    }

    fetchDeck()
  }, [id])

  const handleCardSelection = (cardId: number, isSelected: boolean) => {
    console.log('handleCardSelection called:', { cardId, isSelected })
    setSelectedCardIds(prev => {
      let newSelection: number[]
      if (isSelected) {
        // Only add if not already present (prevent duplicates)
        newSelection = prev.includes(cardId) ? prev : [...prev, cardId]
      } else {
        // Remove all instances of the cardId (in case of duplicates)
        newSelection = prev.filter(id => id !== cardId)
      }
      console.log('selectedCardIds updated:', { prev, newSelection, length: newSelection.length })
      return newSelection
    })
  }

  const handleSaveCardSelection = async () => {
    if (!deck) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/decks/${deck.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardDefinitionIds: selectedCardIds
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update deck')
      }

      // Update the deck state
      setDeck(prev => prev ? {
        ...prev,
        cardDefinitionIds: selectedCardIds
      } : null)

      toaster.create({
        title: 'Success',
        description: `Deck updated successfully! The deck now has ${selectedCardIds.length} card definition${selectedCardIds.length === 1 ? '' : 's'}.`,
        type: 'success'
      })
    } catch (err) {
      console.error('Error updating deck:', err)
      toaster.create({
        title: 'Error',
        description: 'Failed to update deck. Please try again.',
        type: 'error'
      })
    }
  }

  const isOwner = Boolean(user && deck?.cardSet?.user?.id && user.id === deck.cardSet.user.id)

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Center py={20}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      </Box>
    )
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={20}>
          <Center>
            <Box textAlign="center">
              <Text color="red.500" fontSize="lg" mb={6}>
                {error}
              </Text>
              <Button onClick={() => navigate('/card-sets')}>
                Back to Card Sets
              </Button>
            </Box>
          </Center>
        </Container>
      </Box>
    )
  }

  if (!deck) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={20}>
          <Center>
            <Box textAlign="center">
              <Text fontSize="lg" color="gray.600" mb={6}>
                Deck not found
              </Text>
              <Button onClick={() => navigate('/card-sets')}>
                Back to Card Sets
              </Button>
            </Box>
          </Center>
        </Container>
      </Box>
    )
  }

  const renderCardDefinitionsTab = () => {
    if (!deck?.gameCardDefinition?.tableName) return null
    
    return (
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md">Card Definitions</Heading>
          {isOwner && (
            <Button
              onClick={handleSaveCardSelection}
              colorScheme="blue"
              size="sm"
            >
              Save Selection
            </Button>
          )}
        </Flex>
        
        <Box mb={4}>
          <Text fontSize="sm" color="gray.600">
            Selected: {selectedCardIds.length} cards
          </Text>
        </Box>

        {deck.gameCardDefinition.tableName === 'TokenEngineCardDefinition' && (
          <TokenEngineCardDefinitionViewer
            cardDefinitions={cardDefinitions as TokenEngineCardDefinition[]}
            selectedCardIds={selectedCardIds}
            onCardSelectionChange={isOwner ? handleCardSelection : undefined}
            allowSelection={isOwner}
          />
        )}

        {deck.gameCardDefinition.tableName === 'TokenEngineDiscoveryCardDefinition' && (
          <DiscoveryCardDefinitionViewer
            cardDefinitions={cardDefinitions as TokenEngineDiscoveryCardDefinition[]}
            selectedCardIds={selectedCardIds}
            onCardSelectionChange={isOwner ? handleCardSelection : undefined}
            allowSelection={isOwner}
          />
        )}

        {deck.gameCardDefinition.tableName !== 'TokenEngineCardDefinition' && 
         deck.gameCardDefinition.tableName !== 'TokenEngineDiscoveryCardDefinition' && (
          <Box>
            <Text>Unsupported card definition type: {deck.gameCardDefinition.tableName}</Text>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box bg="gray.50">
      {/* Content */}
      {deck && (
        <Box py={16}>
          <Container maxW="container.xl">
            {/* Deck Details */}
            <Box mb={8}>
              <Box>
                <Flex gap={4} mb={4}>
                  <Box 
                    bg="blue.100" 
                    color="blue.800" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    fontSize="md"
                    fontWeight="medium"
                  >
                    {deck.cardSet?.game?.name || 'Unknown Game'}
                  </Box>
                  <Box 
                    bg="green.100" 
                    color="green.800" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    fontSize="md"
                    fontWeight="medium"
                  >
                    {deck.gameCardDefinition?.name || 'Unknown Type'}
                  </Box>
                  <Text color="gray.500" fontSize="sm">
                    {deck.cardDefinitionIds?.length || 0} card{(deck.cardDefinitionIds?.length || 0) !== 1 ? 's' : ''}
                  </Text>
                </Flex>
                
                {deck.description && (
                  <Text fontSize="lg" color="gray.700" lineHeight="tall" mb={4}>
                    {deck.description}
                  </Text>
                )}
                
                <Text fontSize="sm" color="gray.500">
                  Created {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : 'Unknown date'}
                </Text>
              </Box>
            </Box>

            {/* Simple Tab-like Navigation */}
            <Box mb={8}>
              <Flex gap={1} borderBottom="1px" borderColor="gray.200">
                <Box
                  px={4}
                  py={2}
                  borderBottom="2px"
                  borderColor="blue.500"
                  color="blue.600"
                  fontWeight="medium"
                  cursor="pointer"
                >
                  Card Definitions
                </Box>
              </Flex>
            </Box>

            {/* Card Definitions Content */}
            <Box>
              {renderCardDefinitionsTab()}
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  )
}
