import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllVulnerabilities,
  getVulnerabilityStats,
  getAllApplicationVulnerabilities,
} from '@/services/vulnerabilityService'
import { getApplications } from '@/services/applicationService'
import type { VulnerabilitySeverity, VulnerabilityStatus } from '@/types/vulnerability'

export function Security() {
  const [_textColor, setTextColor] = useState('#000000')
  const [severityFilter] = useState<VulnerabilitySeverity | 'all'>('all')
  const [statusFilter] = useState<VulnerabilityStatus | 'all'>('all')
  const [selectedApp] = useState<string>('all')
  const [appSearchQuery, setAppSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: vulnerabilities = [] } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: getAllVulnerabilities,
  })

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

  useEffect(() => {
    const updateColor = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setTextColor(isDark ? '#E8EAF6' : '#1A202C')
    }
    updateColor()
    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  const filteredVulnerabilities = vulnerabilities.filter((vuln) => {
    if (severityFilter !== 'all' && vuln.severity !== severityFilter) return false
    if (statusFilter !== 'all' && vuln.status !== statusFilter) return false
    if (selectedApp !== 'all' && vuln.application_id !== selectedApp) return false
    return true
  })

  const appVulnerabilitySummary = useMemo(() => {
    const summary = appVulnerabilities.map((appVuln) => {
      const app = applications.find((a) => a.id === appVuln.application_id)
      return {
        id: appVuln.application_id,
        name: app?.name || 'Unknown',
        critical: appVuln.stats.critical,
        high: appVuln.stats.high,
        medium: appVuln.stats.medium,
        low: appVuln.stats.low,
        total: appVuln.stats.total,
      }
    })

    const filtered = summary.filter((item) =>
      item.name.toLowerCase().includes(appSearchQuery.toLowerCase())
    )

    const sorted = filtered.sort((a, b) => {
      if (b.critical !== a.critical) return b.critical - a.critical
      if (b.high !== a.high) return b.high - a.high
      if (b.medium !== a.medium) return b.medium - a.medium
      return b.low - a.low
    })

    return sorted
  }, [appVulnerabilities, applications, appSearchQuery])

  const totalPages = Math.ceil(appVulnerabilitySummary.length / itemsPerPage)
  const paginatedApps = appVulnerabilitySummary.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getSeverityBadgeColor = (severity: VulnerabilitySeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600 text-white'
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white'
      case 'low':
        return 'bg-green-500 hover:bg-green-600 text-white'
    }
  }

  const getStatusBadgeColor = (status: VulnerabilityStatus) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'patched':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'mitigated':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'accepted':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive vulnerability management and security insights
          </p>
        </div>
      </div>

      {/* Overview Layer - KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all applications</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats?.critical || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black-500">{stats?.high || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black-500">{stats?.medium || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Application Vulnerability Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Application Vulnerability Summary
              </CardTitle>
              <CardDescription>
                Applications sorted by critical vulnerabilities ({appVulnerabilitySummary.length} total)
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Application</th>
                  <th className="text-center py-3 px-4 font-semibold">Critical</th>
                  <th className="text-center py-3 px-4 font-semibold">High</th>
                  <th className="text-center py-3 px-4 font-semibold">Medium</th>
                  <th className="text-center py-3 px-4 font-semibold">Low</th>
                  <th className="text-center py-3 px-4 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/applications/${app.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {app.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={app.critical > 0 ? 'font-bold text-red-500' : ''}>
                        {app.critical}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={app.high > 0 ? 'font-bold text-orange-500' : ''}>
                        {app.high}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={app.medium > 0 ? 'font-bold text-yellow-600' : ''}>
                        {app.medium}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={app.low > 0 ? 'font-bold text-green-600' : ''}>
                        {app.low}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {app.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, appVulnerabilitySummary.length)} of{' '}
                {appVulnerabilitySummary.length} applications
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {paginatedApps.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application-Level View - Vulnerability List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Vulnerability Details
          </CardTitle>
          <CardDescription>
            Showing {filteredVulnerabilities.length} of {vulnerabilities.length} vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">CVE ID</th>
                  <th className="text-left py-3 px-4 font-semibold">Package</th>
                  <th className="text-left py-3 px-4 font-semibold">Severity</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Age</th>
                  <th className="text-left py-3 px-4 font-semibold">CVSS</th>
                  <th className="text-left py-3 px-4 font-semibold">Fix Available</th>
                </tr>
              </thead>
              <tbody>
                {filteredVulnerabilities.slice(0, 20).map((vuln) => (
                  <tr key={vuln.id} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-4">
                      <Button variant="link" className="p-0 h-auto font-mono text-sm">
                        {vuln.cve_id}
                      </Button>
                    </td>
                    <td className="py-3 px-4 text-sm">{vuln.package}</td>
                    <td className="py-3 px-4">
                      <Badge className={getSeverityBadgeColor(vuln.severity)}>
                        {vuln.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(vuln.status)}>
                        {vuln.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{vuln.age_days || 0} days</td>
                    <td className="py-3 px-4 text-sm">{vuln.cvss_score?.toFixed(1) || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {vuln.patch_available ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVulnerabilities.length > 20 && (
              <div className="mt-4 text-center">
                <Button variant="outline">Load More</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
