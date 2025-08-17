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
  Badge
} from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import CardDefinitionViewer from '../components/CardDefinitionViewer'
import DiscoveryCardDefinitionViewer from '../components/DiscoveryCardDefinitionViewer'
import type { Game } from '../types/Game'
import type { TokenEngineCardDefinition, TokenEngineDiscoveryCardDefinition } from '../types/CardDefinition'

interface CardDefinitionData {
  [tableName: string]: TokenEngineCardDefinition[] | TokenEngineDiscoveryCardDefinition[]
}

export default function GameView() {
  const [game, setGame] = useState<Game | null>(null)
  const [cardDefinitions, setCardDefinitions] = useState<CardDefinitionData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'rules' | string>('rules')
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
        
        // Fetch card definitions for each card definition table
        const cardDefData: CardDefinitionData = {}
        
        for (const cardDefTable of gameData.cardDefinitionTables || []) {
          try {
            // For now, we only handle TokenEngineCardDefinition
            if (cardDefTable.tableName === 'TokenEngineCardDefinition') {
              const cardsResponse = await fetch(`/api/card-definitions/${cardDefTable.tableName}`)
              if (cardsResponse.ok) {
                const cardsData = await cardsResponse.json()
                cardDefData[cardDefTable.tableName] = cardsData
              }
            } else if (cardDefTable.tableName === 'TokenEngineDiscoveryCardDefinition') {
              const cardsResponse = await fetch(`/api/card-definitions/${cardDefTable.tableName}`)
              if (cardsResponse.ok) {
                const cardsData = await cardsResponse.json()
                cardDefData[cardDefTable.tableName] = cardsData
              }
            }
            // Future: Add support for other card definition tables
            // else if (cardDefTable.tableName === 'SplendorDevelopmentCardDefinition') {
            //   const cardsResponse = await fetch('/api/splendor-development-cards')
            //   if (cardsResponse.ok) {
            //     const cardsData = await cardsResponse.json()
            //     cardDefData[cardDefTable.tableName] = cardsData
            //   }
            // }
          } catch (err) {
            console.error(`Error fetching card definitions for ${cardDefTable.tableName}:`, err)
          }
        }
        
        setCardDefinitions(cardDefData)
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
      const trimmedLine = line.trim()
      
      if (trimmedLine.startsWith('# ')) {
        return <Heading key={index} size="lg" mt={6} mb={3} color="gray.800" textAlign="center">{trimmedLine.substring(2)}</Heading>
      } else if (trimmedLine.startsWith('## ')) {
        return <Heading key={index} size="md" mt={4} mb={2} color="gray.700" textAlign="center">{trimmedLine.substring(3)}</Heading>
      } else if (trimmedLine.startsWith('### ')) {
        return <Heading key={index} size="sm" mt={3} mb={2} color="gray.600" textAlign="center">{trimmedLine.substring(4)}</Heading>
      } else if (trimmedLine.startsWith('- ')) {
        return <Text key={index} color="gray.600" textAlign="left">• {trimmedLine.substring(2)}</Text>
      } else if (trimmedLine.startsWith('1. ')) {
        return <Text key={index} color="gray.600" textAlign="left">{trimmedLine}</Text>
      } else if (trimmedLine === '') {
        return <Box key={index} h={2} />
      } else {
        return <Text key={index} color="gray.600" lineHeight="tall" textAlign="left">{trimmedLine}</Text>
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
    <Box bg="gray.50">
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
              
              {/* Card Definition Tables */}
              {game.cardDefinitionTables?.map((cardDefTable) => {
                const cards = cardDefinitions[cardDefTable.tableName] || []
                const hasCards = cards.length > 0
                
                return (
                  <Button
                    key={cardDefTable.id}
                    variant={activeSection === cardDefTable.tableName ? 'solid' : 'ghost'}
                    colorScheme="blue"
                    justifyContent="start"
                    onClick={() => setActiveSection(cardDefTable.tableName)}
                    size="lg"
                    disabled={!hasCards}
                  >
                    🃏 {cardDefTable.name}
                    {hasCards && (
                      <Badge ml={2} colorScheme="green" borderRadius="full">
                        {cards.length}
                      </Badge>
                    )}
                  </Button>
                )
              })}
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
                {(() => {
                  const selectedCardDefTable = game.cardDefinitionTables?.find(
                    table => table.tableName === activeSection
                  )
                  
                  if (!selectedCardDefTable) {
                    return (
                      <Center py={12}>
                        <VStack gap={4}>
                          <Text color="gray.500" fontSize="lg">
                            Card definition table not found.
                          </Text>
                        </VStack>
                      </Center>
                    )
                  }
                  
                  const cards = cardDefinitions[selectedCardDefTable.tableName] || []
                  
                  return (
                    <Box>
                      <Heading size="lg" mb={6} color="gray.800">
                        {selectedCardDefTable.name}
                      </Heading>
                      <Text color="gray.600" mb={6} fontSize="md">
                        {selectedCardDefTable.description}
                      </Text>
                      
                      {cards.length > 0 ? (
                        <Box 
                          maxH="70vh" 
                          overflowY="auto"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                        >
                          {selectedCardDefTable.tableName === 'TokenEngineDiscoveryCardDefinition' ? (
                            <DiscoveryCardDefinitionViewer cardDefinitions={cards as TokenEngineDiscoveryCardDefinition[]} />
                          ) : (
                            <CardDefinitionViewer cardDefinitions={cards as TokenEngineCardDefinition[]} />
                          )}
                        </Box>
                      ) : (
                        <Center py={12}>
                          <VStack gap={4}>
                            <Text color="gray.500" fontSize="lg">
                              No cards available for {selectedCardDefTable.name}.
                            </Text>
                            <Text color="gray.400" fontSize="md">
                              Cards will be added soon!
                            </Text>
                          </VStack>
                        </Center>
                      )}
                    </Box>
                  )
                })()}
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
