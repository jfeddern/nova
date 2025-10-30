import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  MiniMap,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Search, Filter, Layers, AlertTriangle, Shield, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApplications } from '@/services/applicationService'
import { getAllVulnerabilities } from '@/services/vulnerabilityService'
import type { Application, HealthStatus } from '@/types/application'

interface DomainData {
  id: string
  name: string
  applications: Application[]
  departments: Set<string>
  health: HealthStatus
  vulnerabilityCount: number
}

const DOMAIN_COLORS: Record<string, string> = {
  'Customer Experience': '#7c3aed',
  'Platform Services': '#0ea5e9',
  'Communication': '#10b981',
  'Payments & Transactions': '#f59e0b',
  'Data & Analytics': '#ec4899',
  'Operations & Infrastructure': '#6366f1',
}

const HEALTH_COLORS = {
  healthy: '#10b981',
  degraded: '#f59e0b',
  critical: '#ef4444',
}

export function SystemLandscape() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [selectedHealth, setSelectedHealth] = useState<string>('all')
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all')
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'domains' | 'applications'>('domains')
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(true)

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const { data: vulnerabilities = [] } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: getAllVulnerabilities,
  })

  const vulnerabilityCountByApp = useMemo(() => {
    return vulnerabilities.reduce((acc, vuln) => {
      if (vuln.application_id) {
        acc[vuln.application_id] = (acc[vuln.application_id] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  }, [vulnerabilities])

  const domains = useMemo(() => {
    const domainMap = new Map<string, DomainData>()

    applications.forEach((app) => {
      if (!domainMap.has(app.domain)) {
        domainMap.set(app.domain, {
          id: app.domain.toLowerCase().replace(/\s+/g, '-'),
          name: app.domain,
          applications: [],
          departments: new Set(),
          health: 'healthy',
          vulnerabilityCount: 0,
        })
      }

      const domain = domainMap.get(app.domain)!
      domain.applications.push(app)
      domain.departments.add(app.department)
      domain.vulnerabilityCount += vulnerabilityCountByApp[app.id] || 0

      if (app.health === 'critical' || domain.health === 'critical') {
        domain.health = 'critical'
      } else if (app.health === 'degraded' && domain.health !== 'critical') {
        domain.health = 'degraded'
      }
    })

    return Array.from(domainMap.values())
  }, [applications, vulnerabilityCountByApp])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (selectedDomain !== 'all' && app.domain !== selectedDomain) return false
      if (selectedHealth !== 'all' && app.health !== selectedHealth) return false
      if (selectedCriticality !== 'all' && app.criticality !== selectedCriticality) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          app.name.toLowerCase().includes(query) ||
          app.domain.toLowerCase().includes(query) ||
          app.department.toLowerCase().includes(query) ||
          app.owner.team.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [applications, selectedDomain, selectedHealth, selectedCriticality, searchQuery])

  const { nodes: domainNodes, edges: domainEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    const edgeMap = new Map<string, number>()

    if (viewMode === 'domains') {
      domains.forEach((domain, index) => {
        const angle = (index / domains.length) * 2 * Math.PI
        const radius = 400
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        const domainColor = DOMAIN_COLORS[domain.name] || '#6b7280'
        const healthColor = HEALTH_COLORS[domain.health]

        nodes.push({
          id: domain.id,
          type: 'default',
          position: { x, y },
          data: {
            label: (
              <div className="text-center">
                <div className="font-bold text-sm mb-1">{domain.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {domain.applications.length} apps
                </div>
                {domain.vulnerabilityCount > 0 && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    {domain.vulnerabilityCount} vulns
                  </Badge>
                )}
              </div>
            ),
          },
          style: {
            background: domainColor,
            color: 'white',
            border: `3px solid ${healthColor}`,
            borderRadius: '50%',
            width: 180,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
          },
        })
      })

      // Create edges between domains based on app dependencies
      applications.forEach((app) => {
        const sourceDomain = domains.find((d) => d.name === app.domain)
        if (!sourceDomain) return

        app.dependencies.forEach((depId) => {
          const depApp = applications.find((a) => a.id === depId)
          if (!depApp) return

          const targetDomain = domains.find((d) => d.name === depApp.domain)
          if (!targetDomain || sourceDomain.id === targetDomain.id) return

          const edgeKey = `${sourceDomain.id}-${targetDomain.id}`
          edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1)
        })
      })

      edgeMap.forEach((weight, edgeKey) => {
        const [source, target] = edgeKey.split('-')
        edges.push({
          id: edgeKey,
          source,
          target,
          animated: weight > 3,
          style: {
            strokeWidth: Math.min(weight, 8),
            stroke: '#64748b',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#64748b',
          },
          label: weight > 1 ? `${weight}` : undefined,
          labelStyle: { fill: '#64748b', fontWeight: 700 },
        })
      })
    } else {
      // Application view
      const appsByDomain = new Map<string, Application[]>()
      filteredApplications.forEach((app) => {
        if (!appsByDomain.has(app.domain)) {
          appsByDomain.set(app.domain, [])
        }
        appsByDomain.get(app.domain)!.push(app)
      })

      let yOffset = 0
      appsByDomain.forEach((apps, domainName) => {
        const domainColor = DOMAIN_COLORS[domainName] || '#6b7280'

        apps.forEach((app, index) => {
          const x = (index % 4) * 300
          const y = yOffset + Math.floor(index / 4) * 150
          const healthColor = HEALTH_COLORS[app.health]
          const vulnCount = vulnerabilityCountByApp[app.id] || 0

          nodes.push({
            id: app.id,
            type: 'default',
            position: { x, y },
            data: {
              label: (
                <div className="text-center">
                  <div className="font-semibold text-xs mb-1">{app.name}</div>
                  <Badge
                    style={{ backgroundColor: domainColor }}
                    className="text-xs"
                  >
                    {domainName}
                  </Badge>
                  {vulnCount > 0 && (
                    <div className="mt-1">
                      <Badge variant="destructive" className="text-xs">
                        {vulnCount} vulns
                      </Badge>
                    </div>
                  )}
                </div>
              ),
            },
            style: {
              background: 'white',
              border: `3px solid ${healthColor}`,
              borderRadius: 8,
              width: 220,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          })
        })

        yOffset += Math.ceil(apps.length / 4) * 150 + 100
      })

      // Create edges for application dependencies
      filteredApplications.forEach((app) => {
        app.dependencies.forEach((depId) => {
          const depApp = filteredApplications.find((a) => a.id === depId)
          if (depApp) {
            edges.push({
              id: `${app.id}-${depId}`,
              source: app.id,
              target: depId,
              animated: false,
              style: {
                strokeWidth: 2,
                stroke: '#94a3b8',
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94a3b8',
              },
            })
          }
        })
      })
    }

    return { nodes, edges }
  }, [domains, filteredApplications, viewMode, vulnerabilityCountByApp, applications])

  const [nodes, setNodes, onNodesChange] = useNodesState(domainNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(domainEdges)

  useEffect(() => {
    setNodes(domainNodes)
    setEdges(domainEdges)
  }, [domainNodes, domainEdges, setNodes, setEdges])

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (viewMode === 'domains') {
        setSelectedDomain(domains.find((d) => d.id === node.id)?.name || 'all')
        setViewMode('applications')
      } else {
        navigate(`/applications/${node.id}`)
      }
    },
    [viewMode, domains, navigate]
  )

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (query && viewMode === 'domains') {
        setViewMode('applications')
      }

      if (query) {
        const matchedApp = applications.find((app) =>
          app.name.toLowerCase().includes(query.toLowerCase())
        )
        if (matchedApp) {
          setHighlightedNode(matchedApp.id)
        }
      } else {
        setHighlightedNode(null)
      }
    },
    [applications, viewMode]
  )

  const handleResetView = useCallback(() => {
    setViewMode('domains')
    setSearchQuery('')
    setSelectedDomain('all')
    setSelectedHealth('all')
    setSelectedCriticality('all')
    setHighlightedNode(null)
  }, [])

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              System Landscape
            </h1>
            <p className="text-muted-foreground mt-1">
              Holistic view of application dependencies and domains
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={viewMode === 'domains' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('domains')}
            >
              <Layers className="h-4 w-4 mr-2" />
              Domains
            </Button>
            <Button
              variant={viewMode === 'applications' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('applications')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Applications
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetView}>
              Reset View
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {filtersPanelOpen && (
          <div className="w-80 border-r bg-background p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters & Search
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersPanelOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps, domains, teams..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Domain</label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.name}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Health Status</label>
              <Select value={selectedHealth} onValueChange={setSelectedHealth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Criticality</label>
              <Select
                value={selectedCriticality}
                onValueChange={setSelectedCriticality}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="P1">P1 - Critical</SelectItem>
                  <SelectItem value="P2">P2 - High</SelectItem>
                  <SelectItem value="P3">P3 - Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Degraded</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Critical</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Domains:</span>
                  <span className="font-semibold">{domains.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Apps:</span>
                  <span className="font-semibold">{applications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Filtered Apps:
                  </span>
                  <span className="font-semibold">
                    {filteredApplications.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Vulnerabilities:
                  </span>
                  <span className="font-semibold text-red-600">
                    {vulnerabilities.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!filtersPanelOpen && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-24 left-4 z-10"
            onClick={() => setFiltersPanelOpen(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Show Filters
          </Button>
        )}

        <div className="flex-1 bg-white dark:bg-gray-900">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            className="bg-white dark:bg-gray-900"
          >
            <Background color="#e5e7eb" className="dark:opacity-20" />
            <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <MiniMap
              nodeColor={(node) => {
                if (viewMode === 'domains') {
                  const domain = domains.find((d) => d.id === node.id)
                  return DOMAIN_COLORS[domain?.name || ''] || '#6b7280'
                }
                return '#6b7280'
              }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Panel position="top-right" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded shadow text-xs">
              {viewMode === 'domains' ? (
                <div>
                  <p className="font-semibold mb-1">Domain View</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click a domain to see applications
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold mb-1">Application View</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click an app to see details
                  </p>
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
