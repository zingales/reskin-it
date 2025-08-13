import { useState, useEffect } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Flex,
  SimpleGrid,
  Spinner,
  Center,
  Input,
  Icon,
  Button
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { CardSetViewer } from './components/CardSetViewer'
import { useAuth } from './contexts/AuthContext'
import type { CardSet } from './types/CardSet'
import './App.css'

function App() {
  const [cardSets, setCardSets] = useState<CardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [logoutMessage, setLogoutMessage] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Set page title
  useEffect(() => {
    document.title = 'ReskinIt'
  }, [])

  // Handle logout with success message
  const handleLogout = () => {
    logout()
    setLogoutMessage('✅ Logged out successfully!')
    // Clear the message after 3 seconds
    setTimeout(() => {
      setLogoutMessage('')
    }, 3000)
  }

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

  // Filter card sets based on search query
  const filteredCardSets = cardSets.filter(cardSet =>
    cardSet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cardSet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cardSet.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navigation Bar */}
      <Box bg="#667eea" shadow="md" position="fixed" top={0} left={0} right={0} zIndex={1000}>
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Link to="/">
              <Heading size="lg" color="white" cursor="pointer">
                ReskinIt
              </Heading>
            </Link>
            <Flex align="center" gap={4}>
              <Link to="/card-definitions">
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
                  Card Definitions
                </Button>
              </Link>
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
                  My Card Sets
                </Button>
              </Link>
              
              {!authLoading && (
                user ? (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={() => setProfileMenuOpen(true)}
                    >
                      {user.displayName || user.username}
                      <span style={{ fontSize: '0.75rem' }}>▼</span>
                    </button>
                    
                    {profileMenuOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          minWidth: '200px',
                          zIndex: 1000,
                          marginTop: '0.5rem'
                        }}
                        onMouseLeave={() => setProfileMenuOpen(false)}
                      >
                        <div style={{ padding: '0.5rem 0' }}>
                          <div style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #e2e8f0',
                            color: '#4a5568',
                            fontSize: '0.875rem'
                          }}>
                            Signed in as <strong>{user.email}</strong>
                          </div>
                          
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false)
                              // Future: navigate to profile page
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.75rem 1rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#2d3748',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f7fafc'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            👤 Profile Settings
                          </button>
                          
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false)
                              // Future: navigate to account settings
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.75rem 1rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#2d3748',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f7fafc'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            ⚙️ Account Settings
                          </button>
                          
                          <div style={{
                            borderTop: '1px solid #e2e8f0',
                            margin: '0.5rem 0'
                          }}></div>
                          
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false)
                              handleLogout()
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.75rem 1rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#e53e3e',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fed7d7'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            🚪 Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    bg="white"
                    color="blue.600"
                    _hover={{ bg: 'gray.100' }}
                    _active={{ bg: 'gray.200' }}
                    size="sm"
                    fontWeight="medium"
                    px={4}
                    py={2}
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                )
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Logout Success Message */}
      {logoutMessage && (
        <Box 
          position="fixed" 
          top="80px" 
          left="50%" 
          transform="translateX(-50%)" 
          zIndex={999}
          bg="green.100"
          color="green.700"
          px={4}
          py={2}
          borderRadius="md"
          border="1px solid"
          borderColor="green.200"
          boxShadow="md"
        >
          {logoutMessage}
        </Box>
      )}

      {/* Hero Section with Large Logo and Search */}
      <Box 
        minH="100vh"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        pt={16}
      >
        <Container maxW="container.lg" textAlign="center">
          <Box>
            {/* Large Logo */}
            <Box mb={12}>
              <Heading 
                size="4xl" 
                color="white" 
                fontWeight="extrabold"
                letterSpacing="tight"
                textShadow="2px 2px 4px rgba(0,0,0,0.3)"
                mb={6}
              >
                ReskinIt
              </Heading>
              <Text 
                color="white" 
                fontSize="xl" 
                opacity={0.9}
                maxW="2xl"
                lineHeight="tall"
                mx="auto"
              >
                Reskin your favorite card game
              </Text>
            </Box>

            {/* Search Bar */}
            <Box w="full" maxW="600px" mx="auto" position="relative">
              <Input
                placeholder="Search ..."
                bg="white"
                border="none"
                borderRadius="full"
                boxShadow="lg"
                pl={12}
                size="lg"
                _focus={{
                  boxShadow: "xl",
                  transform: "scale(1.02)"
                }}
                transition="all 0.2s"
                color="gray.800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" zIndex={2}>
                <Icon color="gray.400" boxSize={5}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fill="currentColor"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </Icon>
              </Box>
            </Box>



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
    </Box>
  )
}

export default App
