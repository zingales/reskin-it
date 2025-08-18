import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Spinner,
  Center,
  Button,
  VStack,
  Badge,
  SkipNavContent
} from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Prose } from '../components/ui/prose'
import {
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent
} from '../components/ui/accordion'
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
        <SkipNavContent />
        
        {/* Main Content with Accordion */}
        <Box bg="white" borderRadius="lg" shadow="md" p={8}>
          <Heading size="lg" mb={6} color="gray.800">
            {game.name}
          </Heading>
          
          <AccordionRoot collapsible defaultValue={['rules']}>
            {/* Rules Section */}
            <AccordionItem value="rules">
              <AccordionItemTrigger 
                bg="gray.50"
                _hover={{ bg: 'gray.100' }}
                borderRadius="md"
                mb={2}
                px={6}
                py={4}
                w="100%"
                fontWeight="semibold"
                fontSize="lg"
                indicatorPlacement="end"
              >
                📖 Game Rules
              </AccordionItemTrigger>
              <AccordionItemContent pb={6} px={6}>
                <Box 
                  bg="gray.50" 
                  p={6} 
                  borderRadius="md"
                >
                  <Prose>
                    <ReactMarkdown>
                      {game.rules}
                    </ReactMarkdown>
                  </Prose>
                </Box>
              </AccordionItemContent>
            </AccordionItem>
            
            {/* Card Definition Tables */}
            {game.cardDefinitionTables?.map((cardDefTable) => {
              const cards = cardDefinitions[cardDefTable.tableName] || []
              const hasCards = cards.length > 0
              
              return (
                <AccordionItem key={cardDefTable.id} value={cardDefTable.tableName}>
                  <AccordionItemTrigger 
                    bg="gray.50"
                    _hover={{ bg: 'gray.100' }}
                    borderRadius="md"
                    mb={2}
                    disabled={!hasCards}
                    opacity={hasCards ? 1 : 0.6}
                    px={6}
                    py={4}
                    w="100%"
                    fontWeight="semibold"
                    fontSize="lg"
                    indicatorPlacement="end"
                  >
                    🃏 {cardDefTable.name}
                    {hasCards && (
                      <Badge ml={3} colorScheme="green" borderRadius="full" fontSize="sm">
                        {cards.length} cards
                      </Badge>
                    )}
                  </AccordionItemTrigger>
                  <AccordionItemContent pb={6} px={6}>
                    <Box>
                      <Text color="gray.600" mb={4} fontSize="md">
                        {cardDefTable.description}
                      </Text>
                      
                      {cards.length > 0 ? (
                        <Box 
                          maxH="60vh" 
                          overflowY="auto"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                        >
                          {cardDefTable.tableName === 'TokenEngineDiscoveryCardDefinition' ? (
                            <DiscoveryCardDefinitionViewer cardDefinitions={cards as TokenEngineDiscoveryCardDefinition[]} />
                          ) : (
                            <CardDefinitionViewer cardDefinitions={cards as TokenEngineCardDefinition[]} />
                          )}
                        </Box>
                      ) : (
                        <Center py={12}>
                          <VStack gap={4}>
                            <Text color="gray.500" fontSize="lg">
                              No cards available for {cardDefTable.name}.
                            </Text>
                            <Text color="gray.400" fontSize="md">
                              Cards will be added soon!
                            </Text>
                          </VStack>
                        </Center>
                      )}
                    </Box>
                  </AccordionItemContent>
                </AccordionItem>
              )
            })}
          </AccordionRoot>
        </Box>
      </Container>
    </Box>
  )
}
