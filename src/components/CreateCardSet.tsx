import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  Heading,
  Text
} from '@chakra-ui/react'
import { toaster } from '../components/ui/toaster'
import type { CardSet } from '../types/CardSet'

interface CreateCardSetProps {
  onCardSetCreated?: (cardSet: CardSet) => void
  onCancel?: () => void
}

// Consistent form styling - this ensures colors are always correct
const formStyles = {
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#1a202c', // Darker, more readable
    fontSize: '0.875rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    color: '#1a202c', // Dark text for good contrast
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  inputError: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    color: '#1a202c', // Dark text for good contrast
    backgroundColor: 'white',
    border: '1px solid #e53e3e', // Red border for errors
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  inputFocus: {
    border: '1px solid #3182ce',
    boxShadow: '0 0 0 1px #3182ce'
  }
}

export function CreateCardSet({ onCardSetCreated, onCancel }: CreateCardSetProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gameId: '',
    imageUrl: ''
  })
  const [games, setGames] = useState<Array<{ id: number; name: string }>>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingGames, setLoadingGames] = useState(true)

  // Fetch games on component mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games')
        if (response.ok) {
          const gamesData = await response.json()
          setGames(gamesData)
        }
      } catch (error) {
        console.error('Error fetching games:', error)
      } finally {
        setLoadingGames(false)
      }
    }

    fetchGames()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.gameId) {
      newErrors.gameId = 'Game is required'
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required'
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/cardsets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create card set')
      }

      const cardSet = await response.json()
      
      // Show success message
      toaster.create({
        title: 'Success!',
        description: `Card Set "${cardSet.title}" created successfully!`,
        type: 'success',
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        gameId: '',
        imageUrl: ''
      })

      // Call callback if provided
      if (onCardSetCreated) {
        onCardSetCreated(cardSet)
      }
    } catch (error) {
      console.error('Error creating card set:', error)
      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create card set'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = formStyles.inputFocus.border
    e.target.style.boxShadow = formStyles.inputFocus.boxShadow
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = formStyles.input.border
    e.target.style.boxShadow = 'none'
  }

  return (
    <Box 
      maxW="2xl" 
      mx="auto"
      bg="white"
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
      overflow="hidden"
    >
      {/* Header */}
      <Box p={6} borderBottom="1px" borderColor="gray.200">
        <Heading size="lg" color="gray.800">
          Create New Card Set
        </Heading>
        <Text color="gray.600" mt={2}>
          Design your own custom card set with multiple decks. You'll be able to add decks later.
        </Text>
      </Box>



      {/* Form */}
      <Box p={6}>
        <form onSubmit={handleSubmit}>
          <VStack gap={6} align="stretch">
            {/* Title Field */}
            <Box>
              <label style={formStyles.label}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Enter card set title"
                style={errors.title ? formStyles.inputError : formStyles.input}
              />
              {errors.title && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.title}
                </Text>
              )}
            </Box>

            {/* Description Field */}
            <Box>
              <label style={formStyles.label}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Describe your card set..."
                rows={4}
                style={{
                  ...(errors.description ? formStyles.inputError : formStyles.input),
                  resize: 'vertical'
                }}
              />
              {errors.description && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.description}
                </Text>
              )}
            </Box>

            {/* Game Field */}
            <Box>
              <label style={formStyles.label}>
                Game
              </label>
              <select
                value={formData.gameId}
                onChange={(e) => handleInputChange('gameId', e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={errors.gameId ? formStyles.inputError : formStyles.input}
                disabled={loadingGames}
              >
                <option value="">Select a game</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
              {errors.gameId && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.gameId}
                </Text>
              )}
            </Box>

            {/* Image URL Field */}
            <Box>
              <label style={formStyles.label}>
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="https://example.com/image.jpg"
                style={errors.imageUrl ? formStyles.inputError : formStyles.input}
              />
              {errors.imageUrl && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.imageUrl}
                </Text>
              )}
            </Box>

            {/* Submit Buttons */}
            <Box pt={4}>
              <VStack gap={3}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Card Set'}
                </Button>
                {onCancel && (
                  <Button
                    variant="outline"
                    size="lg"
                    width="full"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </VStack>
            </Box>
          </VStack>
        </form>
      </Box>
    </Box>
  )
}
