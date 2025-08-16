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
  VStack,
  HStack,
  Badge
} from '@chakra-ui/react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import CardDefinitionViewer from '../components/CardDefinitionViewer'
import type { Game } from '../types/Game'
import type { TokenEngineCardDefinition } from '../types/CardDefinition'

export default function GameView() {
  const [game, setGame] = useState<Game | null>(null)
  const [cardDefinitions, setCardDefinitions] = useState<TokenEngineCardDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'rules' | 'cards'>('rules')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Set page title
  useEffect(() => {
    if (game) {
      document.title = `${game.name} - Game Details`
    }
  }, [game])

  // Fetch game and card definitions
  useEffect(() => {
    const fetchGameData = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        
        // Fetch game details
        const gameResponse = await fetch(`/api/games/${id}`)
        if (!gameResponse.ok) {
          throw new Error(`HTTP error! status: ${gameResponse.status}`)
        }
        const gameData = await gameResponse.json()
        setGame(gameData)
        
        // Fetch card definitions if this game has them
        if (gameData.cardDefinitionTable === 'TokenEngineCardDefinition') {
          const cardsResponse = await fetch('/api/card-definitions')
          if (cardsResponse.ok) {
            const cardsData = await cardsResponse.json()
            setCardDefinitions(cardsData)
          }
        }
      } catch (err) {
        console.error('Error fetching game data:', err)
        setError('Failed to load game data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [id])

  const renderMarkdownRules = (rules: string) => {
    // Simple markdown rendering for headers and lists
    const lines = rules.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <Heading key={index} size="lg" mt={6} mb={3} color="gray.800">{line.substring(2)}</Heading>
      } else if (line.startsWith('## ')) {
        return <Heading key={index} size="md" mt={4} mb={2} color="gray.700">{line.substring(3)}</Heading>
      } else if (line.startsWith('### ')) {
        return <Heading key={index} size="sm" mt={3} mb={2} color="gray.600">{line.substring(4)}</Heading>
      } else if (line.startsWith('- ')) {
        return <Text key={index} ml={4} color="gray.600">• {line.substring(2)}</Text>
      } else if (line.startsWith('1. ')) {
        return <Text key={index} ml={4} color="gray.600">{line}</Text>
      } else if (line.trim() === '') {
        return <Box key={index} h={2} />
      } else {
        return <Text key={index} color="gray.600" lineHeight="tall">{line}</Text>
      }
    })
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Center py={20}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      </Box>
    )
  }

  if (error || !game) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={16}>
          <Center>
            <VStack gap={4}>
              <Text color="red.500" fontSize="lg">
                {error || 'Game not found'}
              </Text>
              <Button onClick={() => navigate('/games')}>
                Back to Games
              </Button>
            </VStack>
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
            <VStack align="start" gap={1}>
              <Heading size="lg" color="white">
                {game.name}
              </Heading>
              <Text color="blue.100" fontSize="sm">
                {game.summary}
              </Text>
            </VStack>
            <HStack gap={3}>
              <Link to="/games">
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
                  Back to Games
                </Button>
              </Link>
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
                  Home
                </Button>
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        <Flex gap={8}>
          {/* Sidebar Navigation */}
          <Box w="250px" flexShrink={0}>
            <VStack gap={2} align="stretch">
              <Button
                variant={activeSection === 'rules' ? 'solid' : 'ghost'}
                colorScheme="blue"
                justifyContent="start"
                onClick={() => setActiveSection('rules')}
                size="lg"
              >
                📖 Rules
              </Button>
              <Button
                variant={activeSection === 'cards' ? 'solid' : 'ghost'}
                colorScheme="blue"
                justifyContent="start"
                onClick={() => setActiveSection('cards')}
                size="lg"
                disabled={cardDefinitions.length === 0}
              >
                🃏 Card Definitions
                {cardDefinitions.length > 0 && (
                  <Badge ml={2} colorScheme="green" borderRadius="full">
                    {cardDefinitions.length}
                  </Badge>
                )}
              </Button>
            </VStack>
          </Box>

          {/* Main Content */}
          <Box flex={1} bg="white" borderRadius="lg" shadow="md" p={8}>
            {activeSection === 'rules' ? (
              <Box>
                <Heading size="lg" mb={6} color="gray.800">
                  Game Rules
                </Heading>
                <Box 
                  bg="gray.50" 
                  p={6} 
                  borderRadius="md"
                  maxH="70vh"
                  overflowY="auto"
                >
                  {renderMarkdownRules(game.rules)}
                </Box>
              </Box>
            ) : (
              <Box>
                <Heading size="lg" mb={6} color="gray.800">
                  Card Definitions
                </Heading>
                {cardDefinitions.length > 0 ? (
                  <Box 
                    maxH="70vh" 
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <CardDefinitionViewer cardDefinitions={cardDefinitions} />
                  </Box>
                ) : (
                  <Center py={12}>
                    <VStack gap={4}>
                      <Text color="gray.500" fontSize="lg">
                        No card definitions available for this game.
                      </Text>
                      <Text color="gray.400" fontSize="md">
                        Card definitions will be added soon!
                      </Text>
                    </VStack>
                  </Center>
                )}
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
