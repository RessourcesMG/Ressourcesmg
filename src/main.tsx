import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ManagedBlocksProvider } from '@/contexts/ManagedBlocksContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const Webmaster = lazy(() => import('./pages/Webmaster.tsx').then((m) => ({ default: m.Webmaster })))

// Analytics en différé pour ne pas bloquer le premier rendu (surtout sur machines lentes)
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(() => inject(), { timeout: 2000 });
} else {
  setTimeout(() => inject(), 100);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <ManagedBlocksProvider>
        <FavoritesProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={0}>
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
    </ErrorBoundary>
  </StrictMode>,
)
