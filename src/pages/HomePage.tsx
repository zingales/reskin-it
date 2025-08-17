import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Center, 
  Spinner, 
  SimpleGrid,
  Input,
  Flex,
  Button
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CreateCardSet } from '../components/CreateCardSet'
import { CardSetViewer } from '../components/CardSetViewer'
import type { CardSet } from '../types/CardSet'
import type { Game } from '../types/Game'

interface CardSetWithGame extends CardSet {
  game: Game
}

export default function HomePage() {
  const { user } = useAuth()
  const [cardSets, setCardSets] = useState<CardSetWithGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateCardSet, setShowCreateCardSet] = useState(false)

  // Fetch data from database API
  useEffect(() => {
    const fetchCardSets = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/cardsets?include=game,user')
        
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
  }, [])

  // Filter card sets based on search query
  const filteredCardSets = cardSets.filter(cardSet =>
    cardSet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cardSet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cardSet.game?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCardSetCreated = (newCardSet: CardSet) => {
    setCardSets(prev => [...prev, newCardSet as CardSetWithGame])
    setShowCreateCardSet(false)
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Box bg="#667eea" py={20}>
        <Container maxW="container.xl">
          <Box textAlign="center" color="white">
            <Heading 
              size="4xl" 
              mb={6}
              fontWeight="extrabold"
              textShadow="0 4px 8px rgba(0,0,0,0.1)"
            >
              ReskinIt
            </Heading>
            <Text 
              fontSize="xl" 
              mb={8}
              maxW="2xl" 
              mx="auto"
              opacity={0.9}
              lineHeight="tall"
            >
              Transform your favorite board games with custom card sets. 
              Create, share, and discover unique reskins for your gaming experience.
            </Text>
            
            {/* Search Bar */}
            <Box maxW="md" mx="auto" mb={8}>
              <Input
                placeholder="Search card sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
                color="gray.800"
                _placeholder={{ color: 'gray.400' }}
                _focus={{
                  bg: 'white',
                  boxShadow: '0 0 0 1px #667eea'
                }}
                size="lg"
              />
            </Box>

            {/* CTA Buttons */}
            <Flex gap={4} justify="center" flexWrap="wrap">
              <Link to="/games">
                <Button 
                  size="lg"
                  bg="white"
                  color="blue.600"
                  _hover={{ bg: 'gray.100' }}
                  _active={{ bg: 'gray.200' }}
                  fontWeight="semibold"
                  px={8}
                >
                  Browse Games
                </Button>
              </Link>
              
              {user && (
                <Button
                  size="lg"
                  bg="transparent"
                  color="white"
                  border="2px solid white"
                  _hover={{ bg: 'white', color: 'blue.600' }}
                  _active={{ bg: 'gray.100' }}
                  fontWeight="semibold"
                  px={8}
                  onClick={() => setShowCreateCardSet(true)}
                >
                  Create Card Set
                </Button>
              )}
            </Flex>

            {/* Scroll Indicator */}
            <Box 
              position="absolute" 
              bottom={-20} 
              left="50%" 
              transform="translateX(-50%)"
              animation="bounce 2s infinite"
            >
              <Text color="white" fontSize="sm" opacity={0.8}>
                Scroll to explore
              </Text>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content Section */}
      <Box bg="gray.50" py={16}>
        <Container maxW="container.xl">
          {/* Section Header */}
          <Box textAlign="center" mb={12}>
            <Heading 
              size="2xl" 
              color="gray.800" 
              mb={4}
              fontWeight="extrabold"
            >
              Discover What Others Are Reskinning
            </Heading>
            <Text 
              fontSize="lg" 
              color="gray.600" 
              maxW="2xl" 
              mx="auto"
              lineHeight="tall"
            >
              Each card set is a collection of cards that have been reskinned.
            </Text>
          </Box>

          {/* CardSet Grid */}
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
          ) : filteredCardSets.length === 0 ? (
            <Center py={20}>
              <Box textAlign="center">
                <Text color="gray.500" fontSize="lg" mb={2}>
                  No card sets found matching "{searchQuery}"
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Try adjusting your search terms
                </Text>
              </Box>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
              {filteredCardSets.map((cardSet) => (
                <CardSetViewer key={cardSet.id} cardSet={cardSet} />
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      {/* Add CSS for bounce animation */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            40% {
              transform: translateX(-50%) translateY(-10px);
            }
            60% {
              transform: translateX(-50%) translateY(-5px);
            }
          }
        `}
      </style>

      {/* Create Card Set Modal */}
      {showCreateCardSet && (
        <CreateCardSet 
          onCardSetCreated={handleCardSetCreated}
          onCancel={() => setShowCreateCardSet(false)}
        />
      )}
    </Box>
  )
}
