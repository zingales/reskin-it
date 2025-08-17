# ReskinIt

Transform your favorite board games with custom card sets. Create, share, and discover unique reskins for your gaming experience.

## 🎮 What is ReskinIt?

ReskinIt is a web application that allows users to create and share custom card sets for their favorite board games. Weather you want to modify the look of a few existing cards, or completely reskin a game with your own custom theme, ReskinIt provides the tools and community to make it happen.

### Features

- **Create Custom Card Sets**: Design new cards for existing board games
- **Game Management**: Organize cards by game and card type
- **User Authentication**: Secure login and registration system
- **Search & Discovery**: Find card sets by game, creator, or keywords
- **Real-time Updates**: See changes immediately with hot reload

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for PostgreSQL database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reskin-it
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/reskinit"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Start the development environment**
   ```bash
   npm run local:db:update
   ```

   This command will:
   - Start PostgreSQL database using Docker
   - Generate the correct prisma files for both the front and backend
   - Push the database schema
   - Migrate the database
   - Seed the database via upsert


5. **Start the development environment**
   ```bash
   npm run local:full
   ```

   This command will:
   - Start the frontend (Vite) and backed server (Express) concurrently

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

## 🛠️ Development

### Available Scripts

- `npm run dev:local` - Start complete development environment
- `npm run dev` - Start only the frontend development server
- `npm run server` - Start only the backend server
- `npm run build` - Build the application for production
- `npm run 
- `npm run db:push` - Push database schema changes
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with sample data
- `npm run db:studio` - Open Prisma Studio for database management

### Project Structure

```
reskin-it/
├── api/                    # Backend API server
│   ├── index.ts           # Express server entry point
│   └── routes/            # API route handlers
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema definition
│   └── seed.ts           # Database seeding script
├── src/                   # Frontend React application
│   ├── components/        # Reusable React components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
├── public/               # Static assets
└── docker-compose.yml    # Database configuration
```

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Chakra UI for components
- React Router for navigation
- Tailwind CSS for styling

**Backend:**
- Node.js with Express
- Prisma ORM
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing

**Development:**
- ESLint for code linting
- TypeScript for type safety
- Docker for database
- Concurrently for running multiple processes

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Authentication and user profiles
- **Games**: Board games that can have custom card sets
- **CardSets**: Collections of custom cards created by users
- **Decks**: Organized groups of cards within a card set
- **CardDefinitions**: Specific card types and their properties

## 🔧 Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Backend server port (default: 3000)

### Database Setup

The application uses Prisma as the ORM. Key commands:

```bash
# Generate Prisma client
npm run prisma

# Push schema changes to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production environment**
   - Configure production database
   - Set environment variables
   - Set up reverse proxy (nginx, etc.)

3. **Start the production server**
   ```bash
   npm run server
   ```

### Vercel Deployment

The project includes `vercel.json` for easy deployment to Vercel:

```bash
npm install -g vercel
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



**Happy gaming and reskinning! 🎲**
