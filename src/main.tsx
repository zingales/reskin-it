import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Games from './pages/Games.tsx'
import GameView from './pages/GameView.tsx'
import CardSets from './pages/CardSets.tsx'
import CardSetView from './pages/CardSetView.tsx'
import { Auth } from './pages/Auth.tsx'
import { AuthProvider } from './contexts/AuthContext'
import system from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameView />} />
            <Route path="/card-sets" element={<CardSets />} />
            <Route path="/card-sets/:id" element={<CardSetView />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>
)