import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Spinner,
  Center,
  Button,
  Flex,
  SimpleGrid,
  Image
} from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import { toaster } from '../components/ui/toaster'
import type { CardSet } from '../types/CardSet'
import type { Game } from '../types/Game'
import type { Deck } from '../types/Deck'
import type { GameCardDefinition } from '../types/Game'

// Type for CardSet with guaranteed non-null game and decks
type CardSetWithGameAndDecks = Omit<CardSet, 'game' | 'decks'> & { 
  game: Game
  decks: (Deck & { gameCardDefinition: GameCardDefinition })[]
}

export default function CardSetView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cardSet, setCardSet] = useState<CardSetWithGameAndDecks | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDeck, setShowCreateDeck] = useState(false)
  const [gameCardDefinitions, setGameCardDefinitions] = useState<GameCardDefinition[]>([])
  const { user } = useAuth()

  // Form state for creating a new deck
  const [deckForm, setDeckForm] = useState({
    name: '',
    description: '',
    gameCardDefinitionId: ''
  })

  // Set page title
  useEffect(() => {
    document.title = cardSet ? `${cardSet.title} - Card Set` : 'Card Set'
  }, [cardSet])

  useEffect(() => {
    const fetchCardSet = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/cardsets/${id}?include=decks`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Card set not found')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setCardSet(data as CardSetWithGameAndDecks)
        
        // Fetch game card definitions for the game
        const gameCardDefsResponse = await fetch(`/api/games/${data.game.id}/card-definitions`)
        if (gameCardDefsResponse.ok) {
          const gameCardDefs = await gameCardDefsResponse.json()
          setGameCardDefinitions(gameCardDefs)
        }
      } catch (err) {
        console.error('Error fetching card set:', err)
        setError(err instanceof Error ? err.message : 'Failed to load card set')
      } finally {
        setLoading(false)
      }
    }

    fetchCardSet()
  }, [id])

  const handleCreateDeck = async () => {
    if (!cardSet || !deckForm.name || !deckForm.gameCardDefinitionId) {
      toaster.create({
        title: 'Error',
        description: 'Please enter a deck name and select a card type.',
        type: 'error'
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...deckForm,
          cardSetId: cardSet.id,
          gameCardDefinitionId: parseInt(deckForm.gameCardDefinitionId, 10),
          cardDefinitionIds: [] // Empty array for now
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create deck')
      }

      const newDeck = await response.json()
      
      // Update the card set with the new deck
      setCardSet(prev => prev ? {
        ...prev,
        decks: [...prev.decks, newDeck]
      } : null)

      // Reset form
      setDeckForm({
        name: '',
        description: '',
        gameCardDefinitionId: ''
      })
      
      setShowCreateDeck(false)
      
      toaster.create({
        title: 'Success',
        description: 'Deck created successfully!',
        type: 'success'
      })
    } catch (err) {
      console.error('Error creating deck:', err)
      toaster.create({
        title: 'Error',
        description: 'Failed to create deck. Please try again.',
        type: 'error'
      })
    }
  }

  const isOwner = user && cardSet && user.id === cardSet.user.id

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

  if (!cardSet) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={20}>
          <Center>
            <Box textAlign="center">
              <Text fontSize="lg" color="gray.600" mb={6}>
                Card set not found
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

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="#667eea" shadow="md">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="white">
                {cardSet.title}
              </Heading>
              <Text color="white" opacity={0.9} fontSize="sm">
                by {cardSet.user.displayName || cardSet.user.username}
              </Text>
            </Box>
            <Flex gap={3}>
              {isOwner && (
                <Button
                  onClick={() => setShowCreateDeck(true)}
                  bg="white"
                  color="blue.600"
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                  size="sm"
                  fontWeight="medium"
                  px={4}
                  py={2}
                >
                  Add Deck
                </Button>
              )}
              <Link to="/card-sets">
                <Button 
                  bg="white"
                  color="blue.600"
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                  size="sm"
                  fontWeight="medium"
                  px={4}
                  py={2}
                >
                  Back to Card Sets
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Content */}
      <Box py={16}>
        <Container maxW="container.xl">
          {/* Card Set Details */}
          <Box mb={12}>
            <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
              <Box flex="1">
                <Box mb={4}>
                  <Flex gap={4} align="center" mb={4}>
                    <Box 
                      bg="blue.100" 
                      color="blue.800" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                      fontSize="md"
                      fontWeight="medium"
                    >
                      {cardSet.game.name}
                    </Box>
                    <Text color="gray.500" fontSize="sm">
                      {cardSet.decks.length} deck{cardSet.decks.length !== 1 ? 's' : ''}
                    </Text>
                  </Flex>
                  <Text fontSize="lg" color="gray.700" lineHeight="tall" mb={4}>
                    {cardSet.description}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Created {new Date(cardSet.createdAt).toLocaleDateString()}
                  </Text>
                </Box>
              </Box>
              {cardSet.imageUrl && (
                <Box>
                  <Image 
                    src={cardSet.imageUrl} 
                    alt={cardSet.title}
                    borderRadius="lg"
                    boxShadow="lg"
                    maxW="300px"
                  />
                </Box>
              )}
            </Flex>
          </Box>

          <Box borderTop="1px" borderColor="gray.200" mb={8} />

          {/* Decks Section */}
          <Box>
            <Heading size="xl" color="gray.800" mb={6}>
              Decks
            </Heading>
            
            {cardSet.decks.length === 0 ? (
              <Center py={20}>
                <Box textAlign="center">
                  <Text fontSize="lg" color="gray.600" mb={6}>
                    No decks created yet.
                  </Text>
                  {isOwner && (
                    <Button
                      onClick={() => setShowCreateDeck(true)}
                      colorScheme="blue"
                      size="lg"
                    >
                      Create Your First Deck
                    </Button>
                  )}
                </Box>
              </Center>
            ) : (
              <>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                                  {cardSet.decks.map((deck) => (
                  <Link key={deck.id} to={`/decks/${deck.id}`} style={{ textDecoration: 'none' }}>
                    <Box
                      bg="white"
                      borderRadius="lg"
                      p={6}
                      shadow="md"
                      border="1px"
                      borderColor="gray.200"
                      _hover={{ shadow: 'lg' }}
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <Box>
                        <Flex justify="space-between" align="start" mb={2}>
                          <Heading size="md" color="gray.800">
                            {deck.name}
                          </Heading>
                        </Flex>
                        <Box 
                          bg="green.100" 
                          color="green.800" 
                          px={2} 
                          py={1} 
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                          display="inline-block"
                          mb={3}
                        >
                          {deck.gameCardDefinition.name}
                        </Box>
                        
                        {deck.description && (
                          <Text color="gray.600" fontSize="sm" mb={3}>
                            {deck.description}
                          </Text>
                        )}
                        
                        <Text fontSize="sm" color="gray.500">
                          {deck.cardDefinitionIds.length} card{deck.cardDefinitionIds.length !== 1 ? 's' : ''}
                        </Text>
                      </Box>
                    </Box>
                  </Link>
                ))}
                </SimpleGrid>
                
                {/* Add Another Deck Button - Always visible to owner when decks exist */}
                {isOwner && (
                  <Center mt={8}>
                    <Button
                      onClick={() => setShowCreateDeck(true)}
                      colorScheme="blue"
                      size="lg"
                    >
                      Add Another Deck
                    </Button>
                  </Center>
                )}
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Create Deck Modal */}
      {showCreateDeck && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            maxW="600px"
            w="90%"
            maxH="90vh"
            overflowY="auto"
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg">Create New Deck</Heading>
              <Button
                onClick={() => setShowCreateDeck(false)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </Flex>

            <Box>
              <Box mb={4}>
                <Text fontWeight="500" mb={2}>Deck Name *</Text>
                <input
                  type="text"
                  value={deckForm.name}
                  onChange={(e) => setDeckForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter deck name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    border: '1px solid #e2e8f0',
                    outline: 'none'
                  }}
                />
              </Box>

              <Box mb={4}>
                <Text fontWeight="500" mb={2}>Description</Text>
                <textarea
                  value={deckForm.description}
                  onChange={(e) => setDeckForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter deck description (optional)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </Box>

              <Box mb={4}>
                <Text fontWeight="500" mb={2}>Card Type *</Text>
                <select
                  value={deckForm.gameCardDefinitionId}
                  onChange={(e) => setDeckForm(prev => ({ ...prev, gameCardDefinitionId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    border: '1px solid #e2e8f0',
                    outline: 'none'
                  }}
                >
                  <option value="">Select card type</option>
                  {gameCardDefinitions.map((def) => (
                    <option key={def.id} value={def.id}>
                      {def.name}
                    </option>
                  ))}
                </select>
              </Box>


              <Flex gap={3} justify="end">
                <Button onClick={() => setShowCreateDeck(false)}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleCreateDeck}>
                  Create Deck
                </Button>
              </Flex>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
