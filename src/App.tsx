import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Flex,
  SimpleGrid,
  Spinner,
  Center
} from '@chakra-ui/react'
import { CardSetViewer } from './components/CardSetViewer'
import type { CardSet } from './types/CardSet'
import './App.css'

function App() {
  const [cardSets, setCardSets] = useState<CardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from database API
  useEffect(() => {
    const fetchCardSets = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('http://localhost:3001/api/cardsets')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setCardSets(data)
      } catch (err) {
        console.error('Error fetching card sets:', err)
        setError('Failed to load card sets. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCardSets()
  }, [])

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Logo Section */}
      <Box 
        bg="white" 
        boxShadow="sm" 
        position="sticky" 
        top={0} 
        zIndex={10}
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Container maxW="container.xl" py={4}>
          <Flex align="center" justify="center">
            <Box textAlign="center">
              <Heading 
                size="lg" 
                color="blue.600" 
                fontWeight="bold"
                letterSpacing="tight"
              >
                ReskinIt
              </Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                Professional UI Component Library
              </Text>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {/* Hero Section */}
        <Box textAlign="center" mb={12}>
          <Heading 
            size="2xl" 
            color="gray.800" 
            mb={4}
            fontWeight="extrabold"
          >
            Discover Amazing Components
          </Heading>
          <Text 
            fontSize="xl" 
            color="gray.600" 
            maxW="2xl" 
            mx="auto"
            lineHeight="tall"
          >
            Browse our collection of professionally designed components and templates. 
            Each CardSet contains ready-to-use components for your next project.
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
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {cardSets.map((cardSet) => (
              <CardSetViewer key={cardSet.id} cardSet={cardSet} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  )
}

export default App
