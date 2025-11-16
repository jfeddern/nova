import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getPlatformTools, getClusters } from '@/services/platformToolService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, AlertTriangle, CheckCircle2, AlertCircle, Package } from 'lucide-react'
import type { PlatformTool, ToolStatus } from '@/types/platformTool'

const STATUS_CONFIG = {
  up_to_date: {
    label: 'Up to date',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    badge: 'default',
  },
  update_available: {
    label: 'Update available',
    icon: AlertCircle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    badge: 'secondary',
  },
  outdated: {
    label: 'Outdated',
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    badge: 'warning',
  },
  vulnerable: {
    label: 'Vulnerable',
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    badge: 'destructive',
  },
} as const

export function PlatformInventory() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [clusterFilter, setClusterFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<ToolStatus | 'all'>('all')

  const { data: allTools = [], isLoading } = useQuery({
    queryKey: ['platform-tools'],
    queryFn: getPlatformTools,
  })

  const { data: clusters = [] } = useQuery({
    queryKey: ['clusters'],
    queryFn: getClusters,
  })

  const tools = useMemo(() => {
    let filtered = allTools

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(lowerQuery) ||
          tool.description.toLowerCase().includes(lowerQuery) ||
          tool.owner_team.toLowerCase().includes(lowerQuery) ||
          tool.category.toLowerCase().includes(lowerQuery)
      )
    }

    if (clusterFilter !== 'all') {
      filtered = filtered.filter((tool) =>
        tool.current_versions.some((v) => v.cluster === clusterFilter)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((tool) =>
        tool.current_versions.some((v) => v.status === statusFilter)
      )
    }

    return filtered
  }, [allTools, searchQuery, clusterFilter, statusFilter])

  const getToolStatus = (tool: PlatformTool): ToolStatus => {
    const statuses = tool.current_versions.map((v) => v.status)
    if (statuses.includes('vulnerable') || statuses.includes('outdated')) return 'outdated'
    if (statuses.includes('update_available')) return 'update_available'
    return 'up_to_date'
  }

  const getTotalVulnerabilities = (tool: PlatformTool): number => {
    return tool.current_versions.reduce((sum, v) => sum + (v.vulnerabilities || 0), 0)
  }

  const getVersionSummary = (tool: PlatformTool): string => {
    const versions = [...new Set(tool.current_versions.map((v) => v.version))]
    if (versions.length === 1) return versions[0]
    return versions.join(' / ')
  }

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const vulnerable = allTools.filter((tool) =>
      tool.current_versions.some((v) => v.vulnerabilities && v.vulnerabilities > 0)
    )
    const outdated = allTools.filter(
      (tool) =>
        tool.current_versions.some((v) => v.status === 'outdated') &&
        !vulnerable.includes(tool)
    )
    const updateAvailable = allTools.filter(
      (tool) =>
        tool.current_versions.some((v) => v.status === 'update_available') &&
        !vulnerable.includes(tool) &&
        !outdated.includes(tool)
    )
    const upToDate = allTools.filter(
      (tool) =>
        !vulnerable.includes(tool) &&
        !outdated.includes(tool) &&
        !updateAvailable.includes(tool)
    )

    const totalVulnerabilities = allTools.reduce(
      (sum, tool) => sum + getTotalVulnerabilities(tool),
      0
    )

    return {
      vulnerable: vulnerable.length,
      outdated: outdated.length,
      updateAvailable: updateAvailable.length,
      upToDate: upToDate.length,
      totalVulnerabilities,
      total: allTools.length,
      healthPercentage: allTools.length > 0 ? Math.round((upToDate.length / allTools.length) * 100) : 0,
    }
  }, [allTools])

  // Calculate cluster health
  const clusterHealth = useMemo(() => {
    return clusters.map((cluster) => {
      const clusterTools = allTools.filter((tool) =>
        tool.current_versions.some((v) => v.cluster === cluster.name)
      )
      const hasVulnerable = clusterTools.some((tool) =>
        tool.current_versions.some(
          (v) => v.cluster === cluster.name && v.vulnerabilities && v.vulnerabilities > 0
        )
      )
      const hasOutdated = clusterTools.some((tool) =>
        tool.current_versions.some(
          (v) => v.cluster === cluster.name && v.status === 'outdated'
        )
      )
      const hasUpdates = clusterTools.some((tool) =>
        tool.current_versions.some(
          (v) => v.cluster === cluster.name && v.status === 'update_available'
        )
      )

      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      let statusLabel = 'Healthy'
      if (hasVulnerable || hasOutdated) {
        status = 'critical'
        statusLabel = 'Action needed'
      } else if (hasUpdates) {
        status = 'warning'
        statusLabel = 'Minor updates'
      }

      return {
        cluster: cluster.name,
        status,
        statusLabel,
        toolCount: clusterTools.length,
      }
    })
  }, [clusters, allTools])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading platform inventory...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Inventory</h1>
        <p className="text-muted-foreground mt-1">
          Track platform tools, versions, and deployments across all clusters
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-red-200 dark:border-red-900"
          onClick={() => setStatusFilter('outdated')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerable</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metrics.vulnerable}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalVulnerabilities} total {metrics.totalVulnerabilities === 1 ? 'vulnerability' : 'vulnerabilities'}
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200 dark:border-orange-900"
          onClick={() => setStatusFilter('outdated')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outdated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {metrics.outdated}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tools behind latest version
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-900"
          onClick={() => setStatusFilter('update_available')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updates Available</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {metrics.updateAvailable}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minor updates ready
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-green-200 dark:border-green-900"
          onClick={() => setStatusFilter('up_to_date')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Up to Date</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.upToDate}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Running latest versions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Health Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Overall Compliance
            </span>
            <span className="text-sm font-medium">
              {metrics.healthPercentage}% ({metrics.upToDate}/{metrics.total} tools)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                metrics.healthPercentage >= 80
                  ? 'bg-green-600'
                  : metrics.healthPercentage >= 60
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${metrics.healthPercentage}%` }}
            />
          </div>
          {(metrics.vulnerable > 0 || metrics.outdated > 0) && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                ⚠️ {metrics.vulnerable + metrics.outdated} {metrics.vulnerable + metrics.outdated === 1 ? 'tool requires' : 'tools require'} immediate attention
              </p>
            </div>
          )}
          {metrics.updateAvailable > 0 && metrics.vulnerable === 0 && metrics.outdated === 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                📝 {metrics.updateAvailable} {metrics.updateAvailable === 1 ? 'tool has' : 'tools have'} available updates
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cluster Health Summary */}
      {clusterHealth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cluster Status</CardTitle>
            <CardDescription>Quick health overview for each cluster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {clusterHealth.map((ch) => (
                <div
                  key={ch.cluster}
                  className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                    ch.status === 'critical'
                      ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20'
                      : ch.status === 'warning'
                      ? 'border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20'
                      : 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20'
                  }`}
                  onClick={() => setClusterFilter(ch.cluster)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-bold">{ch.cluster}</span>
                    {ch.status === 'critical' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : ch.status === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ch.statusLabel} • {ch.toolCount} tools
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools by name, category, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={clusterFilter} onValueChange={setClusterFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Cluster" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clusters</SelectItem>
            {clusters.map((cluster) => (
              <SelectItem key={cluster.id} value={cluster.name}>
                {cluster.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ToolStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="up_to_date">Up to date</SelectItem>
            <SelectItem value="update_available">Update available</SelectItem>
            <SelectItem value="outdated">Outdated</SelectItem>
            <SelectItem value="vulnerable">Vulnerable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {tools.length} {tools.length === 1 ? 'tool' : 'tools'} found
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Platform Tools
          </CardTitle>
          <CardDescription>
            Infrastructure and platform components deployed across clusters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Tool</th>
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 font-semibold">Owner</th>
                  <th className="text-center py-3 px-4 font-semibold">Clusters</th>
                  <th className="text-left py-3 px-4 font-semibold">Version(s)</th>
                  <th className="text-left py-3 px-4 font-semibold">Latest</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Vulnerabilities</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => {
                  const status = getToolStatus(tool)
                  const statusConfig = STATUS_CONFIG[status]
                  const StatusIcon = statusConfig.icon
                  const totalVulns = getTotalVulnerabilities(tool)

                  return (
                    <tr
                      key={tool.id}
                      className="border-b hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/platform-inventory/${tool.id}`)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{tool.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {tool.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{tool.owner_team}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary">{tool.current_versions.length}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {getVersionSummary(tool)}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {tool.latest_release.version}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm">{statusConfig.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {totalVulns > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {totalVulns}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">0</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {tools.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No tools found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
