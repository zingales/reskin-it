import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Text, 
  Input, 
  Badge,
  Grid,
  VStack,
  HStack
} from '@chakra-ui/react'
import type { TokenType, TokenEngineCardDefinition } from '../types/CardDefinition'

interface TokenEngineCardDefinitionViewerProps {
  cardDefinitions: TokenEngineCardDefinition[]
}

export default function TokenEngineCardDefinitionViewer({ cardDefinitions }: TokenEngineCardDefinitionViewerProps) {
  const [filteredCards, setFilteredCards] = useState<TokenEngineCardDefinition[]>(cardDefinitions)
  const [filters, setFilters] = useState({
    tokens: [] as TokenType[],
    tiers: [] as number[],
    minPoints: 0,
    maxPoints: 5,
    minWhiteCost: 0,
    maxWhiteCost: 7,
    minBlueCost: 0,
    maxBlueCost: 7,
    minGreenCost: 0,
    maxGreenCost: 7,
    minRedCost: 0,
    maxRedCost: 7,
    minBlackCost: 0,
    maxBlackCost: 7
  })

  useEffect(() => {
    let filtered = cardDefinitions

    // Filter by token types
    if (filters.tokens.length > 0) {
      filtered = filtered.filter(card => filters.tokens.includes(card.token))
    }

    // Filter by tiers
    if (filters.tiers.length > 0) {
      filtered = filtered.filter(card => filters.tiers.includes(card.tier))
    }

    // Filter by points range
    filtered = filtered.filter(card => 
      card.points >= filters.minPoints && card.points <= filters.maxPoints
    )

    // Filter by cost ranges
    filtered = filtered.filter(card => {
      const cost = parseCost(card.cost)
      return (
        cost.WHITE >= filters.minWhiteCost && cost.WHITE <= filters.maxWhiteCost &&
        cost.BLUE >= filters.minBlueCost && cost.BLUE <= filters.maxBlueCost &&
        cost.GREEN >= filters.minGreenCost && cost.GREEN <= filters.maxGreenCost &&
        cost.RED >= filters.minRedCost && cost.RED <= filters.maxRedCost &&
        cost.BLACK >= filters.minBlackCost && cost.BLACK <= filters.maxBlackCost
      )
    })

    setFilteredCards(filtered)
  }, [cardDefinitions, filters])

  const getTokenColorScheme = (token: TokenType) => {
    const colors = {
      WHITE: 'gray',
      BLUE: 'blue',
      GREEN: 'green',
      RED: 'red',
      BLACK: 'gray'
    }
    return colors[token] || 'gray'
  }

  const getTierColorScheme = (tier: number) => {
    const colors = {
      1: 'yellow',
      2: 'orange',
      3: 'purple'
    }
    return colors[tier as keyof typeof colors] || 'gray'
  }

  const parseCost = (cost: string | Map<TokenType, number>): Record<TokenType, number> => {
    if (typeof cost === 'string') {
      try {
        return JSON.parse(cost)
      } catch {
        return { WHITE: 0, BLUE: 0, GREEN: 0, RED: 0, BLACK: 0 }
      }
    } else {
      // Convert Map to Record
      const result: Record<TokenType, number> = { WHITE: 0, BLUE: 0, GREEN: 0, RED: 0, BLACK: 0 }
      cost.forEach((value, key) => {
        result[key] = value
      })
      return result
    }
  }

  const RangeSlider = ({ 
    label, 
    minValue, 
    maxValue, 
    onMinChange, 
    onMaxChange, 
    color,
    min = 0,
    max = 7
  }: {
    label: string
    minValue: number
    maxValue: number
    onMinChange: (value: number) => void
    onMaxChange: (value: number) => void
    color: string
    min?: number
    max?: number
  }) => {
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
    const [startX, setStartX] = useState(0)
    const [startMin, setStartMin] = useState(0)
    const [startMax, setStartMax] = useState(0)

    const handleMouseDown = (e: React.MouseEvent, type: 'min' | 'max') => {
      setIsDragging(type)
      setStartX(e.clientX)
      setStartMin(minValue)
      setStartMax(maxValue)
      e.preventDefault()
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX
      const sliderWidth = 200 // Approximate slider width
      const valueChange = Math.round((deltaX / sliderWidth) * (max - min))

      if (isDragging === 'min') {
        const newMin = Math.max(min, Math.min(maxValue - 1, startMin + valueChange))
        onMinChange(newMin)
      } else {
        const newMax = Math.max(minValue + 1, Math.min(max, startMax + valueChange))
        onMaxChange(newMax)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
    }

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove as any)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove as any)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, startX, startMin, startMax])

    const minPercent = ((minValue - min) / (max - min)) * 100
    const maxPercent = ((maxValue - min) / (max - min)) * 100

    return (
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
          {label}: {minValue} - {maxValue}
        </Text>
        <Box 
          position="relative" 
          w="full" 
          h="6px" 
          bg="gray.200" 
          borderRadius="3px"
          cursor="pointer"
        >
          {/* Filled track */}
          <Box
            position="absolute"
            left={`${minPercent}%`}
            right={`${100 - maxPercent}%`}
            h="full"
            bg={color === 'gray' ? '#6b7280' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#6b7280'}
            borderRadius="3px"
          />
          
          {/* Min thumb */}
          <Box
            position="absolute"
            left={`${minPercent}%`}
            top="50%"
            transform="translate(-50%, -50%)"
            w="16px"
            h="16px"
            bg="white"
            border="2px solid"
            borderColor={color === 'gray' ? '#6b7280' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#6b7280'}
            borderRadius="full"
            cursor="grab"
            onMouseDown={(e) => handleMouseDown(e, 'min')}
            _active={{ cursor: 'grabbing' }}
            zIndex={2}
          />
          
          {/* Max thumb */}
          <Box
            position="absolute"
            left={`${maxPercent}%`}
            top="50%"
            transform="translate(-50%, -50%)"
            w="16px"
            h="16px"
            bg="white"
            border="2px solid"
            borderColor={color === 'gray' ? '#6b7280' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#6b7280'}
            borderRadius="full"
            cursor="grab"
            onMouseDown={(e) => handleMouseDown(e, 'max')}
            _active={{ cursor: 'grabbing' }}
            zIndex={2}
          />
        </Box>
      </Box>
    )
  }

  return (
    <Box w="full">
      {/* Filters */}
      <Box bg="white" rounded="lg" shadow="md" p={6} mb={6}>
        <Text fontSize="xl" fontWeight="semibold" mb={4}>Filters</Text>
        
        {/* Basic Filters */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={6}>
          {/* Token Filter */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
              Token Types
            </Text>
            <VStack gap={2} align="stretch">
              {(['WHITE', 'BLUE', 'GREEN', 'RED', 'BLACK'] as TokenType[]).map((token) => (
                <Box key={token} display="flex" alignItems="center">
                  <input
                    type="checkbox"
                    id={`token-${token}`}
                    checked={filters.tokens.includes(token)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, tokens: [...prev.tokens, token] }))
                      } else {
                        setFilters(prev => ({ ...prev, tokens: prev.tokens.filter(t => t !== token) }))
                      }
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  <label 
                    htmlFor={`token-${token}`}
                    style={{ 
                      fontSize: '14px', 
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Box
                      w="12px"
                      h="12px"
                      borderRadius="sm"
                      bg={getTokenColorScheme(token) === 'blue' ? 'blue.500' : 
                          getTokenColorScheme(token) === 'green' ? 'green.500' : 
                          getTokenColorScheme(token) === 'red' ? 'red.500' : 
                          token === 'WHITE' ? 'gray.100' : 'gray.800'}
                      border="1px solid"
                      borderColor="gray.300"
                    />
                    {token}
                  </label>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Tier Filter */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
              Tiers
            </Text>
            <VStack gap={2} align="stretch">
              {[1, 2, 3].map((tier) => (
                <Box key={tier} display="flex" alignItems="center">
                  <input
                    type="checkbox"
                    id={`tier-${tier}`}
                    checked={filters.tiers.includes(tier)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, tiers: [...prev.tiers, tier] }))
                      } else {
                        setFilters(prev => ({ ...prev, tiers: prev.tiers.filter(t => t !== tier) }))
                      }
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  <label 
                    htmlFor={`tier-${tier}`}
                    style={{ 
                      fontSize: '14px', 
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Box
                      w="12px"
                      h="12px"
                      borderRadius="sm"
                      bg={getTierColorScheme(tier) === 'yellow' ? 'yellow.100' : 
                          getTierColorScheme(tier) === 'orange' ? 'orange.100' : 
                          getTierColorScheme(tier) === 'purple' ? 'purple.100' : 'gray.100'}
                      border="1px solid"
                      borderColor="gray.300"
                    />
                    Tier {tier}
                  </label>
                </Box>
              ))}
            </VStack>
          </Box>
        </Grid>

        {/* Points Range Slider */}
        <Box mb={6}>
          <RangeSlider
            label="Points Range"
            minValue={filters.minPoints}
            maxValue={filters.maxPoints}
            onMinChange={(value) => setFilters(prev => ({ ...prev, minPoints: value }))}
            onMaxChange={(value) => setFilters(prev => ({ ...prev, maxPoints: value }))}
            color="blue"
            min={0}
            max={5}
          />
        </Box>

        {/* Cost Filters */}
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Cost Filters</Text>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          <RangeSlider
            label="White Cost"
            minValue={filters.minWhiteCost}
            maxValue={filters.maxWhiteCost}
            onMinChange={(value) => setFilters(prev => ({ ...prev, minWhiteCost: value }))}
            onMaxChange={(value) => setFilters(prev => ({ ...prev, maxWhiteCost: value }))}
            color="gray"
          />
          <RangeSlider
            label="Blue Cost"
            minValue={filters.minBlueCost}
            maxValue={filters.maxBlueCost}
            onMinChange={(value) => setFilters(prev => ({ ...prev, minBlueCost: value }))}
            onMaxChange={(value) => setFilters(prev => ({ ...prev, maxBlueCost: value }))}
            color="blue"
          />
          <RangeSlider
            label="Green Cost"
            minValue={filters.minGreenCost}
            maxValue={filters.maxGreenCost}
            onMinChange={(value) => setFilters(prev => ({ ...prev, minGreenCost: value }))}
            onMaxChange={(value) => setFilters(prev => ({ ...prev, maxGreenCost: value }))}
            color="green"
          />
          <RangeSlider
            label="Red Cost"
            minValue={filters.minRedCost}
            maxValue={filters.maxRedCost}
            onMinChange={(value) => setFilters(prev => ({ ...prev, minRedCost: value }))}
            onMaxChange={(value) => setFilters(prev => ({ ...prev, maxRedCost: value }))}
            color="red"
          />
          <RangeSlider
            label="Black Cost"
            minValue={filters.minBlackCost}
            maxValue={filters.maxBlackCost}
            onMinChange={(value) => setFilters(prev => ({ ...prev, minBlackCost: value }))}
            onMaxChange={(value) => setFilters(prev => ({ ...prev, maxBlackCost: value }))}
            color="gray"
          />
        </Grid>
      </Box>

      {/* Results Count */}
      <Box mb={4}>
        <Text color="gray.600">
          Showing {filteredCards.length} of {cardDefinitions.length} cards
        </Text>
      </Box>

      {/* Cards Table */}
      <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ID
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Token
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tier
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Points
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  White Cost
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Blue Cost
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Green Cost
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Red Cost
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Black Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => {
                const cost = parseCost(card.cost)
                return (
                  <tr key={card.id} style={{ borderBottom: '1px solid #e5e7eb' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      #{card.id}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Box
                        display="inline-block"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                        fontWeight="medium"
                        bg={getTokenColorScheme(card.token) === 'blue' ? 'blue.500' : 
                            getTokenColorScheme(card.token) === 'green' ? 'green.500' : 
                            getTokenColorScheme(card.token) === 'red' ? 'red.500' : 
                            card.token === 'WHITE' ? 'gray.100' : 'gray.800'}
                        color={card.token === 'WHITE' ? 'gray.800' : 'white'}
                      >
                        {card.token}
                      </Box>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Box
                        display="inline-block"
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                        fontWeight="medium"
                        bg={getTierColorScheme(card.tier) === 'yellow' ? 'yellow.100' : 
                            getTierColorScheme(card.tier) === 'orange' ? 'orange.100' : 
                            getTierColorScheme(card.tier) === 'purple' ? 'purple.100' : 'gray.100'}
                        color={getTierColorScheme(card.tier) === 'yellow' ? 'yellow.800' : 
                               getTierColorScheme(card.tier) === 'orange' ? 'orange.800' : 
                               getTierColorScheme(card.tier) === 'purple' ? 'purple.800' : 'gray.800'}
                      >
                        Tier {card.tier}
                      </Box>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                      {card.points}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      {cost.WHITE || 0}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      {cost.BLUE || 0}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      {cost.GREEN || 0}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      {cost.RED || 0}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>
                      {cost.BLACK || 0}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* No Results */}
      {filteredCards.length === 0 && (
        <Box textAlign="center" py={12}>
          <Text color="gray.500" fontSize="lg">No cards match your current filters.</Text>
        </Box>
      )}
    </Box>
  )
}
