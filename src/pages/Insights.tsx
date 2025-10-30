import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getApplications } from '@/services/applicationService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  Activity,
  Users,
  AlertCircle,
  TrendingUp,
  GitBranch,
} from 'lucide-react'
import type { Application, HealthStatus } from '@/types/application'

const HEALTH_COLORS = {
  healthy: '#10b981',
  degraded: '#f59e0b',
  critical: '#ef4444',
}

export function Insights() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all')
  const [healthFilter, setHealthFilter] = useState<string>('all')
  const [textColor, setTextColor] = useState('#000000')

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

  const departments = useMemo(() => {
    return Array.from(new Set(applications.map((app) => app.department)))
  }, [applications])

  const filteredApplications = useMemo(() => {
    return applications.filter((app: Application) => {
      if (departmentFilter !== 'all' && app.department !== departmentFilter) return false
      if (criticalityFilter !== 'all' && app.criticality !== criticalityFilter) return false
      if (healthFilter !== 'all' && app.health !== healthFilter) return false
      return true
    })
  }, [applications, departmentFilter, criticalityFilter, healthFilter])

  const kpis = useMemo(() => {
    const totalApps = filteredApplications.length
    const totalDeps = filteredApplications.reduce((sum, app) => sum + app.dependencies.length, 0)
    const teams = new Set(filteredApplications.map((app) => app.owner.team))
    const totalVulns = filteredApplications.reduce(
      (sum) => sum + (Math.floor(Math.random() * 10)),
      0
    )
    const healthyApps = filteredApplications.filter((app) => app.health === 'healthy').length
    const criticalApps = filteredApplications.filter((app) => app.health === 'critical').length

    return {
      totalApps,
      totalDeps,
      totalTeams: teams.size,
      totalVulns,
      healthyApps,
      criticalApps,
      healthPercent: totalApps > 0 ? Math.round((healthyApps / totalApps) * 100) : 0,
    }
  }, [filteredApplications])

  const healthDistribution = useMemo(() => {
    const distribution: Record<HealthStatus, number> = {
      healthy: 0,
      degraded: 0,
      critical: 0,
    }
    filteredApplications.forEach((app) => {
      distribution[app.health]++
    })
    return [
      { name: 'Healthy', value: distribution.healthy, color: HEALTH_COLORS.healthy },
      { name: 'Degraded', value: distribution.degraded, color: HEALTH_COLORS.degraded },
      { name: 'Critical', value: distribution.critical, color: HEALTH_COLORS.critical },
    ]
  }, [filteredApplications])

  const ownershipByDepartment = useMemo(() => {
    const deptMap: Record<string, number> = {}
    filteredApplications.forEach((app) => {
      deptMap[app.department] = (deptMap[app.department] || 0) + 1
    })
    return Object.entries(deptMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredApplications])

  const teamOwnership = useMemo(() => {
    const teamMap: Record<string, number> = {}
    filteredApplications.forEach((app) => {
      teamMap[app.owner.team] = (teamMap[app.owner.team] || 0) + 1
    })
    return Object.entries(teamMap)
      .map(([team, count]) => ({ team, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filteredApplications])

  const vulnByDepartment = useMemo(() => {
    const vulnMap: Record<string, { critical: number; high: number; medium: number; low: number }> = {}
    filteredApplications.forEach((app) => {
      if (!vulnMap[app.department]) {
        vulnMap[app.department] = { critical: 0, high: 0, medium: 0, low: 0 }
      }
      vulnMap[app.department].critical += Math.floor(Math.random() * 3)
      vulnMap[app.department].high += Math.floor(Math.random() * 5)
      vulnMap[app.department].medium += Math.floor(Math.random() * 8)
      vulnMap[app.department].low += Math.floor(Math.random() * 10)
    })
    return Object.entries(vulnMap).map(([department, vulns]) => ({
      department,
      ...vulns,
    }))
  }, [filteredApplications])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading insights...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insights Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive overview of your application ecosystem
          </p>
        </div>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Criticality</label>
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="P1">P1 - Critical</SelectItem>
                  <SelectItem value="P2">P2 - Important</SelectItem>
                  <SelectItem value="P3">P3 - Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Health Status</label>
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDepartmentFilter('all')
                  setCriticalityFilter('all')
                  setHealthFilter('all')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalApps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.healthPercent}% healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dependencies</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalDeps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Service-to-service links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams Covered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalTeams}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Distinct ownership teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Systems</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{kpis.criticalApps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Distribution</CardTitle>
            <CardDescription>Overview of system health across all applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by Department</CardTitle>
            <CardDescription>Distribution of applications across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ownershipByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis
                  dataKey="department"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: textColor }}
                />
                <YAxis
                  tick={{ fill: textColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Teams by Application Count</CardTitle>
            <CardDescription>Teams managing the most applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamOwnership} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis
                  type="number"
                  tick={{ fill: textColor }}
                />
                <YAxis
                  dataKey="team"
                  type="category"
                  width={150}
                  tick={{ fill: textColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Exposure by Department</CardTitle>
            <CardDescription>Security vulnerabilities across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vulnByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis
                  dataKey="department"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: textColor }}
                />
                <YAxis
                  tick={{ fill: textColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                <Bar dataKey="low" stackId="a" fill="#84cc16" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health Trend</CardTitle>
          <CardDescription>Placeholder for historical health trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={[
                { date: 'Week 1', healthy: 60, degraded: 25, critical: 15 },
                { date: 'Week 2', healthy: 62, degraded: 23, critical: 15 },
                { date: 'Week 3', healthy: 58, degraded: 27, critical: 15 },
                { date: 'Week 4', healthy: 65, degraded: 22, critical: 13 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis
                dataKey="date"
                tick={{ fill: textColor }}
              />
              <YAxis
                tick={{ fill: textColor }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              <Line type="monotone" dataKey="healthy" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="degraded" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Historical trend data will be populated with real-time metrics
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
