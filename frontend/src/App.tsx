import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { Layout } from '@/components/layout/Layout'

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const ApplicationDetails = lazy(() => import('@/pages/ApplicationDetails').then(m => ({ default: m.ApplicationDetails })))
const ApplicationForm = lazy(() => import('@/pages/ApplicationForm').then(m => ({ default: m.ApplicationForm })))
const Security = lazy(() => import('@/pages/Security').then(m => ({ default: m.Security })))
const Teams = lazy(() => import('@/pages/Teams').then(m => ({ default: m.Teams })))
const TeamDetails = lazy(() => import('@/pages/TeamDetails').then(m => ({ default: m.TeamDetails })))
const TeamForm = lazy(() => import('@/pages/TeamForm').then(m => ({ default: m.TeamForm })))
const PlatformInventory = lazy(() => import('@/pages/PlatformInventory').then(m => ({ default: m.PlatformInventory })))
const PlatformToolDetails = lazy(() => import('@/pages/PlatformToolDetails').then(m => ({ default: m.PlatformToolDetails })))
const About = lazy(() => import('@/pages/About').then(m => ({ default: m.About })))

const queryClient = new QueryClient()

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse space-y-4 w-full max-w-4xl px-6">
        <div className="h-8 bg-accent rounded w-1/4" />
        <div className="h-64 bg-accent rounded" />
        <div className="h-48 bg-accent rounded" />
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ChatProvider>
          <Router basename="/nova/" future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="applications/new" element={<ApplicationForm />} />
                  <Route path="applications/:id" element={<ApplicationDetails />} />
                  <Route path="applications/:id/edit" element={<ApplicationForm />} />
                  <Route path="security" element={<Security />} />
                  <Route path="teams" element={<Teams />} />
                  <Route path="teams/new" element={<TeamForm />} />
                  <Route path="teams/:id" element={<TeamDetails />} />
                  <Route path="teams/:id/edit" element={<TeamForm />} />
                  <Route path="platform-inventory" element={<PlatformInventory />} />
                  <Route path="platform-inventory/:id" element={<PlatformToolDetails />} />
                  <Route path="about" element={<About />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </ChatProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
