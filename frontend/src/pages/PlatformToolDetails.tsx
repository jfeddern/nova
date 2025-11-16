import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPlatformToolById } from '@/services/platformToolService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  ExternalLink,
  Package,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Users,
  Calendar,
  Server,
  Shield,
} from 'lucide-react'

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

export function PlatformToolDetails() {
  const { id } = useParams<{ id: string }>()

  const { data: tool, isLoading } = useQuery({
    queryKey: ['platform-tool', id],
    queryFn: () => getPlatformToolById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading tool details...</p>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Tool not found</p>
        <Link to="/platform-inventory">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Platform Inventory
          </Button>
        </Link>
      </div>
    )
  }

  const totalVulnerabilities = tool.current_versions.reduce(
    (sum, v) => sum + (v.vulnerabilities || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/platform-inventory">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Platform Inventory
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <Badge variant="outline">{tool.category}</Badge>
        </div>
        <p className="text-base text-muted-foreground">{tool.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Latest Release
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <code className="text-lg bg-muted px-3 py-1 rounded">
                {tool.latest_release.version}
              </code>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Release Date</p>
              <p className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(tool.latest_release.release_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Changelog</p>
              <a
                href={tool.latest_release.changelog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-primary hover:underline flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Release Notes
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ownership & Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Owner Team</p>
              <p className="text-base">{tool.owner_team}</p>
            </div>
            {tool.maintainer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintainer</p>
                <p className="text-base">{tool.maintainer}</p>
              </div>
            )}
            {tool.license && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">License</p>
                <Badge variant="secondary">{tool.license}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Resources
          </CardTitle>
          <CardDescription>Links to repository and deployment resources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href={tool.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
          >
            <span className="font-medium">Source Repository</span>
            <ExternalLink className="h-4 w-4" />
          </a>
          {tool.chart_repo && (
            <a
              href={tool.chart_repo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
            >
              <span className="font-medium">Helm Chart Repository</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Cluster Deployments
          </CardTitle>
          <CardDescription>
            Current deployments across {tool.current_versions.length}{' '}
            {tool.current_versions.length === 1 ? 'cluster' : 'clusters'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tool.current_versions.map((deployment, index) => {
              const statusConfig = STATUS_CONFIG[deployment.status]
              const StatusIcon = statusConfig.icon

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${statusConfig.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {deployment.cluster}
                        </Badge>
                        <code className="text-sm bg-background/50 px-2 py-1 rounded">
                          v{deployment.version}
                        </code>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Installed:{' '}
                          {new Date(deployment.installed_at).toLocaleDateString()}
                        </span>
                        {deployment.vulnerabilities !== undefined &&
                          deployment.vulnerabilities > 0 && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <Shield className="h-3 w-3" />
                              {deployment.vulnerabilities}{' '}
                              {deployment.vulnerabilities === 1
                                ? 'vulnerability'
                                : 'vulnerabilities'}
                            </span>
                          )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{statusConfig.label}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {totalVulnerabilities > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Shield className="h-5 w-5" />
              Security Alert
            </CardTitle>
            <CardDescription>
              This tool has {totalVulnerabilities} known{' '}
              {totalVulnerabilities === 1 ? 'vulnerability' : 'vulnerabilities'} across
              deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please review the changelog and update to the latest version to address
              security concerns.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
