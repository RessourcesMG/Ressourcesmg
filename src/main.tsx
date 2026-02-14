import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { ManagedBlocksProvider } from '@/contexts/ManagedBlocksContext'

const Webmaster = lazy(() => import('./pages/Webmaster.tsx').then((m) => ({ default: m.Webmaster })))

// Injecte le script Analytics au chargement
inject()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ManagedBlocksProvider>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/webmaster"
            element={
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" aria-hidden /></div>}>
                <Webmaster />
              </Suspense>
            }
          />
        </Routes>
      </ManagedBlocksProvider>
    </BrowserRouter>
  </StrictMode>,
)
