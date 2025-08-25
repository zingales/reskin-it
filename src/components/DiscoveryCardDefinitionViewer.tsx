import { useState, useEffect, useMemo } from 'react'
import { 
  Box, 
  Text, 
  Grid,
  Checkbox,
  ActionBar,
  EmptyState,
  Button,
  HStack,
  VStack,
  Badge,
  Slider,
} from '@chakra-ui/react'
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState
} from '@tanstack/react-table'
import { HiChevronUp, HiChevronDown, HiChevronUpDown } from 'react-icons/hi2'
import type { TokenType, TokenEngineDiscoveryCardDefinition } from '../types/CardDefinition'

interface DiscoveryCardDefinitionViewerProps {
  cardDefinitions: TokenEngineDiscoveryCardDefinition[]
  selectedCardIds?: number[]
  onCardSelectionChange?: (cardId: number, isSelected: boolean) => void
  allowSelection?: boolean
  onSaveEdits?: (selectedIds: number[]) => void
}

// Column helper for type safety
const columnHelper = createColumnHelper<TokenEngineDiscoveryCardDefinition>()

export default function DiscoveryCardDefinitionViewer({ 
  cardDefinitions, 
  selectedCardIds = [], 
  onCardSelectionChange,
  allowSelection = false,
  onSaveEdits
}: DiscoveryCardDefinitionViewerProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
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

  // Parse cost helper function
  const parseCost = (cost: string | Map<TokenType, number>): Record<TokenType, number> => {
    if (typeof cost === 'string') {
      try {
        return JSON.parse(cost)
      } catch {
        return { WHITE: 0, BLUE: 0, GREEN: 0, RED: 0, BLACK: 0 }
      }
    } else {
      const result: Record<TokenType, number> = { WHITE: 0, BLUE: 0, GREEN: 0, RED: 0, BLACK: 0 }
      cost.forEach((value, key) => {
        result[key] = value
      })
      return result
    }
  }

  // Sync row selection with selectedCardIds
  useEffect(() => {
    const newRowSelection: RowSelectionState = {}
    cardDefinitions.forEach((card, index) => {
      if (selectedCardIds.includes(card.id)) {
        newRowSelection[index] = true
      }
    })
    setRowSelection(newRowSelection)
  }, [selectedCardIds, cardDefinitions])

  // Define columns
  const columns = useMemo(() => {
    const cols = [
              ...(allowSelection ? [
          columnHelper.display({
            id: 'select',
            header: ({ table }) => (
              <Checkbox.Root
                defaultChecked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(details) => table.toggleAllPageRowsSelected(!!details.checked)}
              >
                <Checkbox.Control />
              </Checkbox.Root>
            ),
            cell: ({ row }) => (
              <Checkbox.Root
                defaultChecked={row.getIsSelected()}
                onCheckedChange={(details) => row.toggleSelected(!!details.checked)}
              >
                <Checkbox.Control />
              </Checkbox.Root>
            ),
            size: 50,
          })
        ] : []),

      columnHelper.accessor('id', {
        header: 'ID',
        cell: ({ getValue }) => `#${getValue()}`,
        size: 80,
      }),

      columnHelper.accessor('points', {
        header: 'Points',
        cell: ({ getValue }) => (
          <Badge colorScheme="blue" variant="subtle">
            {getValue()}
          </Badge>
        ),
        size: 100,
      }),

      ...(['WHITE','BLUE','GREEN','RED','BLACK'] as TokenType[]).map(color =>
        columnHelper.accessor((row) => {
          const cost = parseCost(row.cost)
          return cost[color] || 0
        }, {
          id: `${color.toLowerCase()}Cost`,
          header: color,
          cell: ({ getValue }) => getValue(),
          size: 80,
        })
      )
    ]
    return cols
  }, [allowSelection])

  // Custom filter function for range filters
  const filteredData = useMemo(() => {
    return cardDefinitions.filter(card => {
      const cost = parseCost(card.cost)
      if (card.points < filters.minPoints || card.points > filters.maxPoints) return false
      if (cost.WHITE < filters.minWhiteCost || cost.WHITE > filters.maxWhiteCost) return false
      if (cost.BLUE < filters.minBlueCost || cost.BLUE > filters.maxBlueCost) return false
      if (cost.GREEN < filters.minGreenCost || cost.GREEN > filters.maxGreenCost) return false
      if (cost.RED < filters.minRedCost || cost.RED > filters.maxRedCost) return false
      if (cost.BLACK < filters.minBlackCost || cost.BLACK > filters.maxBlackCost) return false
      return true
    })
  }, [cardDefinitions, filters])

  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: allowSelection,
    enableMultiRowSelection: allowSelection,
  })

  // Handle row selection changes
  useEffect(() => {
    if (onCardSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows
      const selectedIds = selectedRows.map(row => row.original.id)
      const deselectedIds = selectedCardIds.filter(id => !selectedIds.includes(id))
      const newlySelectedIds = selectedIds.filter(id => !selectedCardIds.includes(id))
      deselectedIds.forEach(id => onCardSelectionChange(id, false))
      newlySelectedIds.forEach(id => onCardSelectionChange(id, true))
    }
  }, [rowSelection, onCardSelectionChange, selectedCardIds, table])

  const SortIcon = ({ column }: { column: { getCanSort: () => boolean; getIsSorted: () => false | 'asc' | 'desc' } }) => {
    if (!column.getCanSort()) return null
    const isSorted = column.getIsSorted()
    if (isSorted === 'asc') return <HiChevronUp size={16} />
    if (isSorted === 'desc') return <HiChevronDown size={16} />
    return <HiChevronUpDown size={16} color="gray" />
  }

  const RangeFilter = ({
    label, minValue, maxValue, onMinChange, onMaxChange, min = 0, max = 7, colorPalette = "gray"
  }: {
    label: string
    minValue: number
    maxValue: number
    onMinChange: (value: number) => void
    onMaxChange: (value: number) => void
    min?: number
    max?: number
    colorPalette?: string
  }) => {
    const [localValue, setLocalValue] = useState([minValue, maxValue])
    
    const handleChange = (details: { value: number[] }) => {
      if (details.value.length === 2) {
        setLocalValue(details.value)
      }
    }
    
    const handleChangeEnd = (details: { value: number[] }) => {
      if (details.value.length === 2) {
        onMinChange(details.value[0])
        onMaxChange(details.value[1])
      }
    }
    
    // Update local value when props change
    useEffect(() => {
      setLocalValue([minValue, maxValue])
    }, [minValue, maxValue])

    return (
      <Box py={2}>
        <Text fontSize="sm" fontWeight="medium" mb={3}>
          {label}: {minValue} - {maxValue}
        </Text>
        <Box px={2}>
          <Slider.Root
            width="100%"
            value={localValue}
            min={min}
            max={max}
            step={1}
            colorPalette={colorPalette}
            onValueChange={handleChange}
            onValueChangeEnd={handleChangeEnd}
            thumbAlignment="center"
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumbs />
            </Slider.Control>
          </Slider.Root>
        </Box>
      </Box>
    )
  }

  const handleSaveEdits = () => {
    if (onSaveEdits) {
      const selectedRows = table.getFilteredSelectedRowModel().rows
      const selectedIds = selectedRows.map(row => row.original.id)
      onSaveEdits(selectedIds)
      // Clear selection after saving
      table.toggleAllRowsSelected(false)
    }
  }

  const handleClearSelection = () => {
    table.toggleAllRowsSelected(false)
  }

  return (
    <Box w="full">
      {allowSelection && table.getFilteredSelectedRowModel().rows.length > 0 && (
        <ActionBar.Root>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.CloseTrigger />
              <ActionBar.SelectionTrigger>
                {table.getFilteredSelectedRowModel().rows.length} selected
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <HStack gap={3}>
                <Button size="sm" variant="outline" onClick={handleClearSelection}>
                  Clear Selection
                </Button>
                {onSaveEdits && (
                  <Button size="sm" colorScheme="blue" onClick={handleSaveEdits}>
                    Save Edits
                  </Button>
                )}
              </HStack>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </ActionBar.Root>
      )}

      {/* Filters */}
      <Box bg="white" rounded="lg" shadow="md" p={6} mb={6}>
        <Text fontSize="xl" fontWeight="semibold" mb={4}>Filters</Text>
        <VStack gap={4} align="stretch">
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            <RangeFilter
              label="Points Range"
              minValue={filters.minPoints}
              maxValue={filters.maxPoints}
              onMinChange={(value) => setFilters(p => ({ ...p, minPoints: value }))}
              onMaxChange={(value) => setFilters(p => ({ ...p, maxPoints: value }))}
              min={0}
              max={5}
              colorPalette="yellow"
            />
            <RangeFilter label="White Cost" minValue={filters.minWhiteCost} maxValue={filters.maxWhiteCost}
              onMinChange={v => setFilters(p => ({ ...p, minWhiteCost: v }))}
              onMaxChange={v => setFilters(p => ({ ...p, maxWhiteCost: v }))}
              colorPalette="white" />
            <RangeFilter label="Blue Cost" minValue={filters.minBlueCost} maxValue={filters.maxBlueCost}
              onMinChange={v => setFilters(p => ({ ...p, minBlueCost: v }))}
              onMaxChange={v => setFilters(p => ({ ...p, maxBlueCost: v }))}
              colorPalette="blue" />
            <RangeFilter label="Green Cost" minValue={filters.minGreenCost} maxValue={filters.maxGreenCost}
              onMinChange={v => setFilters(p => ({ ...p, minGreenCost: v }))}
              onMaxChange={v => setFilters(p => ({ ...p, maxGreenCost: v }))}
              colorPalette="green" />
            <RangeFilter label="Red Cost" minValue={filters.minRedCost} maxValue={filters.maxRedCost}
              onMinChange={v => setFilters(p => ({ ...p, minRedCost: v }))}
              onMaxChange={v => setFilters(p => ({ ...p, maxRedCost: v }))}
              colorPalette="red" />
            <RangeFilter label="Black Cost" minValue={filters.minBlackCost} maxValue={filters.maxBlackCost}
              onMinChange={v => setFilters(p => ({ ...p, minBlackCost: v }))}
              onMaxChange={v => setFilters(p => ({ ...p, maxBlackCost: v }))}
              colorPalette="black" />
          </Grid>
        </VStack>
      </Box>

      <Box mb={4}>
        <Text color="gray.600">
          Showing {filteredData.length} of {cardDefinitions.length} discovery cards
        </Text>
      </Box>

              <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                          userSelect: 'none',
                          borderBottom: '1px solid #e5e7eb'
                        }}
                        onMouseEnter={(e) => {
                          if (header.column.getCanSort()) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (header.column.getCanSort()) {
                            e.currentTarget.style.backgroundColor = '#f9fafb'
                          }
                        }}
                      >
                        <HStack gap={2}>
                          <Box>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </Box>
                          <SortIcon column={header.column} />
                        </HStack>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => {
                  const isSelected = row.getIsSelected()
                  return (
                    <tr
                      key={row.id}
                      style={{
                        backgroundColor: isSelected ? '#ebf8ff' : 'transparent',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: allowSelection ? 'pointer' : 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected ? '#dbeafe' : '#f9fafb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected ? '#ebf8ff' : 'transparent'
                      }}
                      onClick={(e) => {
                        // Prevent row click when clicking on checkbox
                        if (e.target instanceof HTMLElement && 
                            (e.target.closest('[role="checkbox"]') || e.target.closest('input[type="checkbox"]'))) {
                          return
                        }
                        if (allowSelection) {
                          row.toggleSelected(!row.getIsSelected())
                        }
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          style={{
                            padding: '16px',
                            fontSize: '14px',
                            color: '#111827'
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Box>
        </Box>

      {filteredData.length === 0 && (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <Box
                w="12"
                h="12"
                borderRadius="full"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="lg" color="gray.500">🔍</Text>
              </Box>
            </EmptyState.Indicator>
            <EmptyState.Title>No discovery cards found</EmptyState.Title>
            <EmptyState.Description>
              No discovery cards match your current filters. Try adjusting your search criteria.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      )}
    </Box>
  )
}
