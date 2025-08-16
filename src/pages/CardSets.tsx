import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Spinner,
  Center,
  Button,
  Flex,
  SimpleGrid
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { CardSetViewer } from '../components/CardSetViewer'
import { CreateCardSet } from '../components/CreateCardSet'
import { useAuth } from '../contexts/AuthContext'
import { toaster } from '../components/ui/toaster'
import type { CardSet } from '../types/CardSet'
import type { Game } from '../types/Game'

// Type for CardSet with guaranteed non-null game (same as CardSetViewer expects)
type CardSetWithGame = Omit<CardSet, 'game'> & { game: Game }

export default function CardSets() {
  const [cardSets, setCardSets] = useState<CardSetWithGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { user } = useAuth()

  // Set page title
  useEffect(() => {
    document.title = 'Card Sets'
  }, [])

  useEffect(() => {
    const fetchCardSets = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let url = '/api/cardsets?include=game,user'
        let headers: HeadersInit = {}
        
        // If user is authenticated, fetch their card sets
        if (user) {
          url = '/api/cardsets/user/me?include=game,user'
          const token = localStorage.getItem('token')
          if (token) {
            headers = {
              'Authorization': `Bearer ${token}`
            }
          }
        }
        
        const response = await fetch(url, { headers })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        // Type assertion since we know the API includes game data
        setCardSets(data as CardSetWithGame[])
      } catch (err) {
        console.error('Error fetching card sets:', err)
        setError('Failed to load card sets. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCardSets()
  }, [user])

  const handleCardSetCreated = (newCardSet: CardSet) => {
    // Type assertion since we know the API includes game data
    setCardSets(prev => [newCardSet as CardSetWithGame, ...prev])
    setShowCreateForm(false)
    toaster.create({
      title: 'Success',
      description: 'Card set created successfully!',
      type: 'success'
    })
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="#667eea" shadow="md">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="white">
              Card Sets
            </Heading>
            <Flex gap={3}>
              {user && !showCreateForm && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  bg="white"
                  color="blue.600"
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                  size="sm"
                  fontWeight="medium"
                  px={4}
                  py={2}
                >
                  Create New Set
                </Button>
              )}
              <Link to="/">
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
                  Back to Home
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Content */}
      <Box py={16}>
        <Container maxW="container.xl">
          {/* Show Create Form or Card Sets List */}
          {showCreateForm ? (
            <Box>
              <Box mb={6}>
                <Button
                  onClick={handleCancelCreate}
                  variant="outline"
                  size="sm"
                  mb={4}
                >
                  ← Back to Card Sets
                </Button>
                <Heading size="xl" color="gray.800" mb={2}>
                  Create New Card Set
                </Heading>
                <Text color="gray.600">
                  Design your own custom card set with multiple decks.
                </Text>
              </Box>
              <CreateCardSet 
                onCardSetCreated={handleCardSetCreated}
                onCancel={handleCancelCreate}
              />
            </Box>
          ) : (
            <>
              {/* Section Header */}
              <Box textAlign="center" mb={12}>
                <Heading 
                  size="2xl" 
                  color="gray.800" 
                  mb={4}
                  fontWeight="extrabold"
                >
                  {user ? 'Your Card Sets' : 'All Card Sets'}
                </Heading>
                <Text 
                  fontSize="lg" 
                  color="gray.600" 
                  maxW="2xl" 
                  mx="auto"
                  lineHeight="tall"
                >
                  {user 
                    ? 'Create and manage your custom card sets. Each set can contain multiple decks for endless gameplay possibilities.'
                    : 'Browse all available card sets. Sign in to create your own custom sets.'
                  }
                </Text>
              </Box>

              {loading ? (
                <Center py={20}>
                  <Spinner size="xl" color="blue.500" />
                </Center>
              ) : error ? (
                <Center py={20}>
                  <Text color="red.500" fontSize="lg">
                    {error}
                  </Text>
                </Center>
              ) : cardSets.length === 0 ? (
                <Center py={20}>
                  <Box textAlign="center">
                    <Text fontSize="lg" color="gray.600" mb={6}>
                      {user 
                        ? 'You haven\'t created any card sets yet.'
                        : 'No card sets available yet.'
                      }
                    </Text>
                    {user && (
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        colorScheme="blue"
                        size="lg"
                      >
                        Create Your First Card Set
                      </Button>
                    )}
                  </Box>
                </Center>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                  {cardSets.map((cardSet) => (
                    <CardSetViewer key={cardSet.id} cardSet={cardSet} />
                  ))}
                </SimpleGrid>
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  )
}