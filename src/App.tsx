import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ApplicationDetails } from '@/pages/ApplicationDetails'
import { ApplicationForm } from '@/pages/ApplicationForm'
import { SystemLandscape } from '@/pages/SystemLandscape'
import { Insights } from '@/pages/Insights'
import { Security } from '@/pages/Security'
import { Teams } from '@/pages/Teams'
import { TeamDetails } from '@/pages/TeamDetails'
import { TeamForm } from '@/pages/TeamForm'
import { PlatformInventory } from '@/pages/PlatformInventory'
import { PlatformToolDetails } from '@/pages/PlatformToolDetails'
import { About } from '@/pages/About'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router basename="/nova/" future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="applications/new" element={<ApplicationForm />} />
              <Route path="applications/:id" element={<ApplicationDetails />} />
              <Route path="applications/:id/edit" element={<ApplicationForm />} />
              <Route path="landscape" element={<SystemLandscape />} />
              <Route path="insights" element={<Insights />} />
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
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
