import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Package,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllVulnerabilities,
  getVulnerabilityStats,
  getAllApplicationVulnerabilities,
} from '@/services/vulnerabilityService'
import { getApplications } from '@/services/applicationService'
import type { Vulnerability, VulnerabilitySeverity, VulnerabilityStatus } from '@/types/vulnerability'

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#fbbf24',
  low: '#84cc16',
}

export function Security() {
  const [textColor, setTextColor] = useState('#000000')
  const [severityFilter, setSeverityFilter] = useState<VulnerabilitySeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<VulnerabilityStatus | 'all'>('all')
  const [selectedApp, setSelectedApp] = useState<string>('all')
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

  const severityDistribution = [
    { name: 'Critical', value: stats?.critical || 0, color: SEVERITY_COLORS.critical },
    { name: 'High', value: stats?.high || 0, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: stats?.medium || 0, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: stats?.low || 0, color: SEVERITY_COLORS.low },
  ]

  const statusDistribution = [
    { status: 'Open', count: vulnerabilities.filter((v) => v.status === 'open').length },
    { status: 'In Progress', count: vulnerabilities.filter((v) => v.status === 'in_progress').length },
    { status: 'Patched', count: vulnerabilities.filter((v) => v.status === 'patched').length },
    { status: 'Mitigated', count: vulnerabilities.filter((v) => v.status === 'mitigated').length },
    { status: 'Resolved', count: vulnerabilities.filter((v) => v.status === 'resolved').length },
  ]

  const appRiskData = appVulnerabilities
    .map((appVuln) => {
      const app = applications.find((a) => a.id === appVuln.application_id)
      return {
        name: app?.name || 'Unknown',
        critical: appVuln.stats.critical,
        high: appVuln.stats.high,
        medium: appVuln.stats.medium,
        low: appVuln.stats.low,
        total: appVuln.stats.total,
      }
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const ageDistribution = vulnerabilities.reduce((acc, vuln) => {
    if (!vuln.age_days) return acc
    const bucket = vuln.age_days < 30 ? '<30 days' : vuln.age_days < 60 ? '30-60 days' : vuln.age_days < 90 ? '60-90 days' : '>90 days'
    acc[bucket] = (acc[bucket] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const ageData = Object.entries(ageDistribution).map(([age, count]) => ({ age, count }))

  const packageBreakdown = vulnerabilities.reduce((acc, vuln) => {
    const pkg = vuln.package.split('/')[0] || vuln.package
    acc[pkg] = (acc[pkg] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const technologyData = Object.entries(packageBreakdown)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const patchedCount = vulnerabilities.filter((v) => v.status === 'patched' || v.status === 'resolved').length
  const patchRate = stats ? ((patchedCount / stats.total) * 100).toFixed(1) : 0

  const mttrData = appVulnerabilities
    .map((appVuln) => {
      const app = applications.find((a) => a.id === appVuln.application_id)
      const resolvedVulns = appVuln.vulnerabilities.filter(
        (v) => v.status === 'resolved' || v.status === 'patched'
      )
      const avgAge = resolvedVulns.length
        ? resolvedVulns.reduce((sum, v) => sum + (v.age_days || 0), 0) / resolvedVulns.length
        : 0
      return {
        name: app?.name || 'Unknown',
        mttr: Math.round(avgAge),
      }
    })
    .filter((d) => d.mttr > 0)
    .sort((a, b) => b.mttr - a.mttr)
    .slice(0, 10)

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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as VulnerabilitySeverity | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as VulnerabilityStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="patched">Patched</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Application</label>
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <CardTitle className="text-sm font-medium">Patch Rate</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patchRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Patched or resolved</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {vulnerabilities.filter((v) => v.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* Overview Layer - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability by Severity</CardTitle>
            <CardDescription>Distribution across all applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patch Status Distribution</CardTitle>
            <CardDescription>Current remediation progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="status" tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
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

      {/* Analysis Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Risky Applications</CardTitle>
            <CardDescription>By total vulnerability count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={appRiskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis type="number" tick={{ fill: textColor }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Legend />
                <Bar dataKey="critical" stackId="a" fill={SEVERITY_COLORS.critical} name="Critical" />
                <Bar dataKey="high" stackId="a" fill={SEVERITY_COLORS.high} name="High" />
                <Bar dataKey="medium" stackId="a" fill={SEVERITY_COLORS.medium} name="Medium" />
                <Bar dataKey="low" stackId="a" fill={SEVERITY_COLORS.low} name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Age Distribution</CardTitle>
            <CardDescription>Time since detection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="age" tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affected Technology Breakdown</CardTitle>
            <CardDescription>Top 10 vulnerable packages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={technologyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: textColor }} />
                <YAxis tick={{ fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mean Time to Remediate (MTTR)</CardTitle>
            <CardDescription>Average days to resolve by application</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mttrData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis type="number" tick={{ fill: textColor }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: textColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Bar dataKey="mttr" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
