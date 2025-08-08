import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.cardSet.deleteMany()

  // Seed with initial CardSet data
  const cardSets = [
    {
      title: "Modern UI Components",
      description: "A collection of modern, responsive UI components built with React and Chakra UI",
      imageUrl: "https://placehold.co/300x200/4299E1/FFFFFF?text=UI+Components",
      category: "UI/UX",
    },
    {
      title: "E-commerce Templates",
      description: "Complete e-commerce website templates with shopping cart functionality",
      imageUrl: "https://placehold.co/300x200/48BB78/FFFFFF?text=E-commerce",
      category: "E-commerce",
    },
    {
      title: "Dashboard Layouts",
      description: "Professional dashboard layouts with charts, tables, and analytics",
      imageUrl: "https://placehold.co/300x200/ED8936/FFFFFF?text=Dashboard",
      category: "Dashboard",
    },
    {
      title: "Mobile App Templates",
      description: "Cross-platform mobile app templates with native-like performance",
      imageUrl: "https://placehold.co/300x200/9F7AEA/FFFFFF?text=Mobile+App",
      category: "Mobile",
    },
    {
      title: "Landing Page Designs",
      description: "High-converting landing page templates for various industries",
      imageUrl: "https://placehold.co/300x200/F56565/FFFFFF?text=Landing+Page",
      category: "Marketing",
    },
    {
      title: "Admin Panels",
      description: "Feature-rich admin panel templates with user management",
      imageUrl: "https://placehold.co/300x200/38B2AC/FFFFFF?text=Admin+Panel",
      category: "Admin",
    },
  ]

  for (const cardSet of cardSets) {
    await prisma.cardSet.create({
      data: cardSet,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
