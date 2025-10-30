import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <NavBar />
      <main className="flex-1 container mx-auto px-6 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
