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
  SimpleGrid,
  VStack
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import type { Game } from '../types/Game'
import { toaster } from '../components/ui/toaster'

export default function Games() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Set page title
  useEffect(() => {
    document.title = 'Games'
  }, [])

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/games')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setGames(data)
      } catch (err) {
        console.error('Error fetching games:', err)
        setError('Failed to load games. Please try again later.')
        toaster.create({
          title: 'Error',
          description: 'Failed to load games. Please try again later.',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleGameClick = (gameId: number) => {
    navigate(`/games/${gameId}`)
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="#667eea" shadow="md">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="white">
              Games
            </Heading>
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
        </Container>
      </Box>

      {/* Content */}
      <Box py={16}>
        <Container maxW="container.xl">
          {/* Section Header */}
          <Box textAlign="center" mb={12}>
            <Heading 
              size="2xl" 
              color="gray.800" 
              mb={4}
              fontWeight="extrabold"
            >
              Available Games
            </Heading>
            <Text 
              fontSize="lg" 
              color="gray.600" 
              maxW="2xl" 
              mx="auto"
              lineHeight="tall"
            >
              Browse and learn about the different games available in our system.
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
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {games.map((game) => (
                <Box 
                  key={game.id} 
                  bg="white"
                  borderRadius="lg"
                  shadow="md"
                  p={6}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: 'translateY(-4px)',
                    shadow: 'lg'
                  }}
                  onClick={() => handleGameClick(game.id)}
                >
                  <VStack align="stretch" gap={4}>
                    <Heading size="md" color="gray.800">
                      {game.name}
                    </Heading>
                    <Text color="gray.600" lineHeight="tall">
                      {game.summary}
                    </Text>
                    <Button 
                      colorScheme="blue" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGameClick(game.id)
                      }}
                    >
                      View Game
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}

          {/* No Games */}
          {!loading && !error && games.length === 0 && (
            <Center py={20}>
              <VStack gap={4}>
                <Text color="gray.500" fontSize="lg">
                  No games available yet.
                </Text>
                <Text color="gray.400" fontSize="md">
                  Check back later for new games!
                </Text>
              </VStack>
            </Center>
          )}
        </Container>
      </Box>
    </Box>
  )
}
