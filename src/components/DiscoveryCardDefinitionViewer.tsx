import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Text, 
  Grid,
  VStack,
} from '@chakra-ui/react'
import type { TokenType, TokenEngineDiscoveryCardDefinition } from '../types/CardDefinition'

interface DiscoveryCardDefinitionViewerProps {
  cardDefinitions: TokenEngineDiscoveryCardDefinition[]
}

export default function DiscoveryCardDefinitionViewer({ cardDefinitions }: DiscoveryCardDefinitionViewerProps) {
  const [filteredCards, setFilteredCards] = useState<TokenEngineDiscoveryCardDefinition[]>(cardDefinitions)
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const [filters, setFilters] = useState({
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

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortConfig.key) {
          case 'id':
            aValue = a.id
            bValue = b.id
            break
          case 'points':
            aValue = a.points
            bValue = b.points
            break
          case 'whiteCost':
            aValue = parseCost(a.cost).WHITE
            bValue = parseCost(b.cost).WHITE
            break
          case 'blueCost':
            aValue = parseCost(a.cost).BLUE
            bValue = parseCost(b.cost).BLUE
            break
          case 'greenCost':
            aValue = parseCost(a.cost).GREEN
            bValue = parseCost(b.cost).GREEN
            break
          case 'redCost':
            aValue = parseCost(a.cost).RED
            bValue = parseCost(b.cost).RED
            break
          case 'blackCost':
            aValue = parseCost(a.cost).BLACK
            bValue = parseCost(b.cost).BLACK
            break
          default:
            return 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    setFilteredCards(filtered)
  }, [cardDefinitions, filters, sortConfig])

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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '▴' : '▾'
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
      return undefined
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
          Showing {filteredCards.length} of {cardDefinitions.length} discovery cards
        </Text>
      </Box>

      {/* Cards Table */}
      <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th 
                  style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('id')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  ID {getSortIcon('id')}
                </th>
                <th 
                  style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('points')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Points {getSortIcon('points')}
                </th>
                <th 
                  style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('whiteCost')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  White{getSortIcon('whiteCost')}
                </th>
                <th 
                  style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('blueCost')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Blue{getSortIcon('blueCost')}
                </th>
                <th 
                  style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('greenCost')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Green{getSortIcon('greenCost')}
                </th>
                <th 
                  style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('redCost')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Red{getSortIcon('redCost')}
                </th>
                <th 
                  style={{ 
                    padding: '12px 24px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#6b7280', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('blackCost')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  Black{getSortIcon('blackCost')}
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
          <Text color="gray.500" fontSize="lg">No discovery cards match your current filters.</Text>
        </Box>
      )}
    </Box>
  )
}
