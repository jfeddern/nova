// ABOUTME: Unified Security & Tech Stack page providing comprehensive portfolio overview.
// ABOUTME: Combines vulnerability tracking, SBOM data, runtime/framework inventory for all personas.

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Shield,
  AlertTriangle,
  Package,
  Search,
  Calendar,
  FileSearch,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  getVulnerabilityStats,
  getAllApplicationVulnerabilities,
} from '@/services/vulnerabilityService'
import { getApplications } from '@/services/applicationService'
import { getTechLandscape } from '@/services/techLandscapeService'
import type { RuntimeStatus } from '@/types/techstack'

interface UnifiedAppData {
  id: string
  name: string
  language: string
  runtime: string
  runtimeStatus: RuntimeStatus | null
  frameworks: string[]
  critical: number
  high: number
  medium: number
  low: number
  total: number
  hasSbom: boolean
}

const getRuntimeStatusBadge = (status: RuntimeStatus | null) => {
  if (!status) return null

  switch (status) {
    case 'ok':
      return <Badge className="bg-green-500 text-white text-xs">OK</Badge>
    case 'eol_soon':
      return <Badge className="bg-yellow-500 text-white text-xs">EOL Soon</Badge>
    case 'eol':
      return <Badge className="bg-red-500 text-white text-xs">EOL</Badge>
  }
}

export function Security() {
  const [appSearchQuery, setAppSearchQuery] = useState('')
  const [depSearchQuery, setDepSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeSection, setActiveSection] = useState('overview')
  const itemsPerPage = 10

  const { data: stats } = useQuery({
    queryKey: ['vulnerability-stats'],
    queryFn: getVulnerabilityStats,
  })

  const { data: appVulnerabilities = [] } = useQuery({
    queryKey: ['app-vulnerabilities'],
    queryFn: getAllApplicationVulnerabilities,
  })

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const { data: techLandscape } = useQuery({
    queryKey: ['tech-landscape'],
    queryFn: getTechLandscape,
  })

  // Scroll spy for sidebar navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'applications', 'dependencies']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' })
    }
  }

  // Build unified application data
  const unifiedApps = useMemo(() => {
    if (!techLandscape) return []

    const appMap = new Map<string, UnifiedAppData>()

    // Process tech stack data
    techLandscape.runtimeDistribution.forEach((runtime) => {
      runtime.apps.forEach((app) => {
        if (!appMap.has(app.id)) {
          appMap.set(app.id, {
            id: app.id,
            name: app.name,
            language: '',
            runtime: '',
            runtimeStatus: null,
            frameworks: [],
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0,
            hasSbom: true,
          })
        }
        const appData = appMap.get(app.id)!
        appData.language = runtime.language
        appData.runtime = `${runtime.runtime} ${runtime.version}`
        appData.runtimeStatus = runtime.status
      })
    })

    techLandscape.frameworkDistribution.forEach((framework) => {
      framework.apps.forEach((app) => {
        if (!appMap.has(app.id)) {
          appMap.set(app.id, {
            id: app.id,
            name: app.name,
            language: '',
            runtime: '',
            runtimeStatus: null,
            frameworks: [],
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0,
            hasSbom: true,
          })
        }
        const appData = appMap.get(app.id)!
        appData.frameworks.push(`${framework.name} ${framework.version}`)
      })
    })

    // Add vulnerability data
    appVulnerabilities.forEach((appVuln) => {
      const app = applications.find((a) => a.id === appVuln.application_id)
      if (!app) return

      if (!appMap.has(appVuln.application_id)) {
        appMap.set(appVuln.application_id, {
          id: appVuln.application_id,
          name: app.name,
          language: 'N/A',
          runtime: 'No SBOM data',
          runtimeStatus: null,
          frameworks: [],
          critical: appVuln.stats.critical,
          high: appVuln.stats.high,
          medium: appVuln.stats.medium,
          low: appVuln.stats.low,
          total: appVuln.stats.total,
          hasSbom: false,
        })
      } else {
        const appData = appMap.get(appVuln.application_id)!
        appData.critical = appVuln.stats.critical
        appData.high = appVuln.stats.high
        appData.medium = appVuln.stats.medium
        appData.low = appVuln.stats.low
        appData.total = appVuln.stats.total
      }
    })

    return Array.from(appMap.values())
  }, [techLandscape, appVulnerabilities, applications])

  const filteredApps = unifiedApps.filter((app) => {
    const query = appSearchQuery.toLowerCase()
    return (
      app.name.toLowerCase().includes(query) ||
      app.language.toLowerCase().includes(query) ||
      app.runtime.toLowerCase().includes(query) ||
      app.frameworks.some((fw) => fw.toLowerCase().includes(query))
    )
  })

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (b.critical !== a.critical) return b.critical - a.critical
    if (b.high !== a.high) return b.high - a.high
    if (b.medium !== a.medium) return b.medium - a.medium
    return b.low - a.low
  })

  const totalPages = Math.ceil(sortedApps.length / itemsPerPage)
  const paginatedApps = sortedApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Filter dependencies
  const filteredDependencies = useMemo(() => {
    if (!techLandscape) return []

    const query = depSearchQuery.toLowerCase()
    if (!query) return techLandscape.criticalDependencies

    return techLandscape.criticalDependencies.filter((dep) => {
      return (
        dep.name.toLowerCase().includes(query) ||
        dep.version.toLowerCase().includes(query) ||
        dep.issue.toLowerCase().includes(query) ||
        dep.affectedApps.some((app) => app.name.toLowerCase().includes(query))
      )
    })
  }, [techLandscape, depSearchQuery])

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'applications', label: 'Applications', icon: Package },
    { id: 'dependencies', label: 'Dependencies', icon: AlertTriangle },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r bg-background sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6 space-y-1">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">SECTIONS</h2>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Security & Tech Stack
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive portfolio overview of vulnerabilities, dependencies, and technology inventory
            </p>
          </div>
        </div>

        {/* Overview Section */}
        <section id="overview" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{techLandscape?.summary.totalApps || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {techLandscape?.summary.appsWithSbom || 0} with SBOM
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SBOM Coverage</CardTitle>
                <FileSearch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {techLandscape
                    ? Math.round((techLandscape.summary.appsWithSbom / techLandscape.summary.totalApps) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">Portfolio coverage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats?.critical || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                <Shield className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{stats?.high || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">High priority</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {techLandscape?.summary.totalWarnings || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Medium priority</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">EOL Runtimes</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {techLandscape?.summary.appsWithEol || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Need upgrades</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Applications Section */}
        <section id="applications" className="scroll-mt-20">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Applications
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unified view of technology stack and security status ({sortedApps.length} total)
                  </p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search apps, languages, runtimes..."
                    value={appSearchQuery}
                    onChange={(e) => {
                      setAppSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-semibold text-sm">Application</th>
                      <th className="text-left p-3 font-semibold text-sm">Language</th>
                      <th className="text-left p-3 font-semibold text-sm">Runtime</th>
                      <th className="text-left p-3 font-semibold text-sm">Frameworks</th>
                      <th className="text-center p-3 font-semibold text-sm">Critical</th>
                      <th className="text-center p-3 font-semibold text-sm">High</th>
                      <th className="text-center p-3 font-semibold text-sm">Medium</th>
                      <th className="text-center p-3 font-semibold text-sm">Low</th>
                      <th className="text-center p-3 font-semibold text-sm">SBOM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApps.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="p-3">
                          <Link
                            to={`/applications/${app.id}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {app.name}
                          </Link>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{app.language || 'N/A'}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span>{app.runtime || 'N/A'}</span>
                            {getRuntimeStatusBadge(app.runtimeStatus)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {app.frameworks.length > 0 ? (
                              app.frameworks.slice(0, 2).map((fw, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {fw}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                            {app.frameworks.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{app.frameworks.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className={app.critical > 0 ? 'font-bold text-red-500' : 'text-muted-foreground'}>
                            {app.critical}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={app.high > 0 ? 'font-bold text-orange-500' : 'text-muted-foreground'}>
                            {app.high}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={app.medium > 0 ? 'font-bold text-yellow-600' : 'text-muted-foreground'}>
                            {app.medium}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={app.low > 0 ? 'font-bold text-green-600' : 'text-muted-foreground'}>
                            {app.low}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {app.hasSbom ? (
                            <Badge className="bg-green-500 text-white text-xs">✓</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">-</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paginatedApps.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications found matching your search</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, sortedApps.length)} of {sortedApps.length} applications
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                    >
                      Previous
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Critical Dependencies Section */}
        <section id="dependencies" className="scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                 Dependencies
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Security issues affecting multiple applications
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dependencies by name, version, issue, or affected app..."
                    value={depSearchQuery}
                    onChange={(e) => setDepSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {!techLandscape || techLandscape.criticalDependencies.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                    <p className="text-muted-foreground">No critical dependencies found</p>
                  </div>
                ) : filteredDependencies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No dependencies match your search</p>
                  </div>
                ) : (
                  filteredDependencies.map((dep, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border rounded-lg ${
                        dep.severity === 'critical'
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900'
                          : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {dep.name} {dep.version}
                            </span>
                            {dep.severity === 'critical' ? (
                              <Badge className="bg-red-500 text-white gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Critical
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500 text-white gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Warning
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{dep.issue}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">
                              Affects {dep.affectedApps.length} {dep.affectedApps.length === 1 ? 'app' : 'apps'}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {dep.affectedApps.slice(0, 3).map((app) => (
                                <Link key={app.id} to={`/applications/${app.id}`}>
                                  <Badge variant="outline" className="text-xs hover:bg-accent cursor-pointer">
                                    {app.name}
                                  </Badge>
                                </Link>
                              ))}
                              {dep.affectedApps.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{dep.affectedApps.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {techLandscape && filteredDependencies.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredDependencies.length} {filteredDependencies.length !== techLandscape.criticalDependencies.length && `of ${techLandscape.criticalDependencies.length}`} critical {techLandscape.criticalDependencies.length === 1 ? 'dependency' : 'dependencies'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
