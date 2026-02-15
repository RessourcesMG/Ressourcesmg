import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ManagedBlocksProvider } from '@/contexts/ManagedBlocksContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'

const Webmaster = lazy(() => import('./pages/Webmaster.tsx').then((m) => ({ default: m.Webmaster })))

// Reporter l'analytics après le premier rendu pour ne pas bloquer le chargement (surtout sur machines lentes)
function deferAnalytics() {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => import('@vercel/analytics').then(({ inject }) => inject()), { timeout: 3000 })
  } else {
    setTimeout(() => import('@vercel/analytics').then(({ inject }) => inject()), 500)
  }
}
deferAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ManagedBlocksProvider>
        <FavoritesProvider>
          <TooltipProvider delayDuration={300} skipDelayDuration={0}>
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
          </TooltipProvider>
        </FavoritesProvider>
        </ManagedBlocksProvider>
    </BrowserRouter>
  </StrictMode>,
)
