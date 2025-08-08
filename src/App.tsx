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
import './App.css'

// Mock data structure for CardSet - replace with actual database connection
interface CardSet {
  id: number
  title: string
  description: string
  imageUrl: string
  category: string
  createdAt: string
}

// Mock data - replace with actual database query
const mockCardSets: CardSet[] = [
  {
    id: 1,
    title: "Modern UI Components",
    description: "A collection of modern, responsive UI components built with React and Chakra UI",
    imageUrl: "https://via.placeholder.com/300x200/4299E1/FFFFFF?text=UI+Components",
    category: "UI/UX",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "E-commerce Templates",
    description: "Complete e-commerce website templates with shopping cart functionality",
    imageUrl: "https://via.placeholder.com/300x200/48BB78/FFFFFF?text=E-commerce",
    category: "E-commerce",
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    title: "Dashboard Layouts",
    description: "Professional dashboard layouts with charts, tables, and analytics",
    imageUrl: "https://via.placeholder.com/300x200/ED8936/FFFFFF?text=Dashboard",
    category: "Dashboard",
    createdAt: "2024-01-25"
  },
  {
    id: 4,
    title: "Mobile App Templates",
    description: "Cross-platform mobile app templates with native-like performance",
    imageUrl: "https://via.placeholder.com/300x200/9F7AEA/FFFFFF?text=Mobile+App",
    category: "Mobile",
    createdAt: "2024-02-01"
  },
  {
    id: 5,
    title: "Landing Page Designs",
    description: "High-converting landing page templates for various industries",
    imageUrl: "https://via.placeholder.com/300x200/F56565/FFFFFF?text=Landing+Page",
    category: "Marketing",
    createdAt: "2024-02-05"
  },
  {
    id: 6,
    title: "Admin Panels",
    description: "Feature-rich admin panel templates with user management",
    imageUrl: "https://via.placeholder.com/300x200/38B2AC/FFFFFF?text=Admin+Panel",
    category: "Admin",
    createdAt: "2024-02-10"
  }
]

function App() {
  const [cardSets, setCardSets] = useState<CardSet[]>([])
  const [loading, setLoading] = useState(true)

  // Simulate database fetch - replace with actual database query
  useEffect(() => {
    const fetchCardSets = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCardSets(mockCardSets)
      setLoading(false)
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
