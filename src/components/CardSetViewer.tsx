import { 
  Box, 
  Heading, 
  Text, 
  Image, 
  Flex
} from '@chakra-ui/react'
import type { CardSet } from '../types/CardSet'

interface CardSetViewerProps {
  cardSet: CardSet
}

export function CardSetViewer({ cardSet }: CardSetViewerProps) {
  return (
    <Box 
      bg="white"
      borderRadius="lg"
      overflow="hidden" 
      border="1px"
      borderColor="gray.200"
      _hover={{ 
        transform: 'translateY(-4px)', 
        boxShadow: 'lg',
        transition: 'all 0.2s'
      }}
      cursor="pointer"
    >
      <Image 
        src={cardSet.imageUrl} 
        alt={cardSet.title}
        height="200px"
        width="100%"
        objectFit="cover"
      />
      <Box p={6}>
        <Heading size="md" color="gray.800" mb={3}>
          {cardSet.title}
        </Heading>
        <Text color="gray.600" mb={4}>
          {cardSet.description}
        </Text>
        <Flex justify="space-between" align="center">
          <Box 
            bg="blue.100" 
            color="blue.800" 
            px={3} 
            py={1} 
            borderRadius="full"
            fontSize="sm"
            fontWeight="medium"
          >
            {cardSet.category}
          </Box>
          {/* <Text fontSize="sm" color="gray.500">
            {new Date(cardSet.createdAt).toLocaleDateString()}
          </Text> */}
        </Flex>
      </Box>
    </Box>
  )
}
