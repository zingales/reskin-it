import { useState, useEffect } from 'react'
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
import { Link } from 'react-router-dom'
import TokenEngineCardDefinitionViewer from '../components/CardDefinitionViewer'
import type { TokenEngineCardDefinition } from '../types/CardDefinition'

export default function CardDefinitions() {
  const [cardDefinitions, setCardDefinitions] = useState<TokenEngineCardDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set page title
  useEffect(() => {
    document.title = 'Card Definitions'
  }, [])

  // Fetch card definitions from API
  useEffect(() => {
    const fetchCardDefinitions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('http://localhost:3001/api/card-definitions')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setCardDefinitions(data)
      } catch (err) {
        console.error('Error fetching card definitions:', err)
        setError('Failed to load card definitions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCardDefinitions()
  }, [])

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="#667eea" shadow="md">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="white">
              Card Definitions
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
              Card Definitions Database
            </Heading>
            <Text 
              fontSize="lg" 
              color="gray.600" 
              maxW="2xl" 
              mx="auto"
              lineHeight="tall"
            >
              Browse and filter through all available card definitions with their costs and properties.
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
            <TokenEngineCardDefinitionViewer cardDefinitions={cardDefinitions} />
          )}
        </Container>
      </Box>
    </Box>
  )
}
