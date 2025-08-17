import { useState } from 'react'
import { 
  Box, 
  Container, 
  Heading, 
  Flex,
  Button
} from '@chakra-ui/react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Toaster, toaster } from './components/ui/toaster'
import './App.css'

export default function App() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { user, logout, loading: authLoading } = useAuth()

  // Handle logout with success message
  const handleLogout = () => {
    logout()
    toaster.create({
      title: 'Success',
      description: 'Logged out successfully!',
      type: 'success'
    })
  }

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
                  Games
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
                  <Link to="/auth">
                    <Button 
                      bg="transparent"
                      color="white"
                      border="1px solid white"
                      _hover={{ bg: 'white', color: 'blue.600' }}
                      _active={{ bg: 'gray.100' }}
                      size="sm"
                      fontWeight="medium"
                      px={4}
                      py={2}
                    >
                      Sign In
                    </Button>
                  </Link>
                )
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box pt={20}>
        <Outlet />
      </Box>

      {/* Global Toaster */}
      <Toaster />
    </Box>
  )
}
