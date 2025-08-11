import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import CardDefinitions from './pages/CardDefinitions.tsx'
import system from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/card-definitions" element={<CardDefinitions />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)