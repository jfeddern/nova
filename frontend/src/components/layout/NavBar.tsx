import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Users, Info, Sparkles, Sun, Moon, Satellite, Shield, Package, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'

export function NavBar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { path: '/', label: 'Applications', icon: LayoutGrid },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/security', label: 'Security & Tech Stack', icon: Shield },
    { path: '/release-monitor', label: 'Release Monitor', icon: Bell },
    { path: '/platform-inventory', label: 'Platform', icon: Package },
    { path: '/about', label: 'About', icon: Info },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Satellite className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Nova
              </span>
            </Link>
            <div className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-105'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-2 rounded-xl"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </nav>
  )
}
