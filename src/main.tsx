import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.tsx'
import { Webmaster } from './pages/Webmaster.tsx'

// Injecte le script Analytics au chargement
inject()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/webmaster" element={<Webmaster />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
