# Reskin It - Card Game Application

A full-stack React + TypeScript + Vite application with Express backend and Prisma database.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev:full
   ```

This will start both the frontend (Vite) and backend (Express) servers concurrently.

## 🔧 Available Scripts

- `npm run dev` - Run only the frontend
- `npm run server` - Run only the backend  
- `npm run dev:full` - Run both frontend and backend together
- `npm run build` - Build for production
- `npm run seed` - Seed the database with initial data

## 🌍 Environment Variables

Copy `env.example` to `.env` and configure:

- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Secret key for JWT authentication

**Note:** The `.env` file is gitignored for security. For production deployment, set these variables in your hosting platform's environment configuration.

## 🗄️ Database

This project uses Prisma with SQLite for development. For production, consider using PostgreSQL or MySQL.

## 🔒 Security

- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- Environment variables are kept secure and not committed to git

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
