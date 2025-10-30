import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getApplicationById, getApplications } from '@/services/applicationService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DependencyGraph } from '@/components/applications/DependencyGraph'
import { VulnerabilityPanel } from '@/components/vulnerabilities/VulnerabilityPanel'
import KnownIssuesTab from '@/components/KnownIssues/KnownIssuesTab'
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Mail,
  MessageSquare,
  Users,
  Building2,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Database,
  FileText,
  Shield,
  BookOpen,
} from 'lucide-react'

type TabType = 'overview' | 'vulnerabilities' | 'known-issues'

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id!),
    enabled: !!id,
  })

  const { data: allApplications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading application details...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Application not found</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const criticalityColors = {
    P1: 'destructive',
    P2: 'warning',
    P3: 'secondary',
  } as const

  const downstreamApplications = allApplications.filter((app) =>
    application.dependencies.includes(app.id)
  )

  const upstreamApplications = allApplications.filter((app) =>
    app.dependencies.includes(application.id)
  )

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FileText },
    { id: 'vulnerabilities' as TabType, label: 'Vulnerabilities', icon: Shield },
    { id: 'known-issues' as TabType, label: 'Known Issues', icon: BookOpen },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link to={`/applications/${application.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{application.name}</h1>
          <Badge variant={criticalityColors[application.criticality]}>
            {application.criticality}
          </Badge>
          <Badge variant="outline">{application.environment}</Badge>
        </div>
        <p className="text-base text-muted-foreground italic">{application.brief}</p>
        <p className="text-sm text-muted-foreground mt-2">{application.description}</p>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team</p>
                  <p className="text-base">{application.owner.team}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact</p>
                  <a
                    href={`mailto:${application.owner.contact_email}`}
                    className="text-base text-primary hover:underline flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {application.owner.contact_email}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">MS Teams Channel</p>
                  <a
                    href={`teams://channel?team=T1234&id=${application.owner.teams_channel}`}
                    className="text-base text-primary hover:underline flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {application.owner.teams_channel}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {application.department}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Links to external resources and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={application.links.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
                >
                  <span className="font-medium">Repository</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={application.links.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
                >
                  <span className="font-medium">Documentation</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={application.links.monitoring}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
                >
                  <span className="font-medium">Monitoring Dashboard</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                {application.customLinks && application.customLinks.length > 0 && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        Additional Resources
                      </p>
                    </div>
                    {application.customLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
                      >
                        <span className="font-medium">{link.title}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {application.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dependencies & Datastores</CardTitle>
              <CardDescription>
                Services and datastores connected to {application.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowUp className="h-4 w-4 text-primary" />
                    <span>Upstream Services ({upstreamApplications.length})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Services consuming this application
                  </p>
                  <div className="space-y-2">
                    {upstreamApplications.length > 0 ? (
                      upstreamApplications.map((app) => (
                        <Link key={app.id} to={`/applications/${app.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{app.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {app.department}
                              </span>
                            </div>
                            <Badge
                              variant={criticalityColors[app.criticality]}
                              className="text-xs"
                            >
                              {app.criticality}
                            </Badge>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No upstream services
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowDown className="h-4 w-4 text-primary" />
                    <span>Downstream Services ({downstreamApplications.length})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Services used by this application
                  </p>
                  <div className="space-y-2">
                    {downstreamApplications.length > 0 ? (
                      downstreamApplications.map((app) => (
                        <Link key={app.id} to={`/applications/${app.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{app.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {app.department}
                              </span>
                            </div>
                            <Badge
                              variant={criticalityColors[app.criticality]}
                              className="text-xs"
                            >
                              {app.criticality}
                            </Badge>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No downstream services
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Database className="h-4 w-4 text-primary" />
                    <span>Datastores ({application.datastores.length})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Data storage used by this application
                  </p>
                  <div className="space-y-2">
                    {application.datastores.length > 0 ? (
                      application.datastores.map((datastore) => (
                        <div
                          key={datastore.id}
                          className="flex items-center justify-between p-3 rounded-md border bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{datastore.name}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {datastore.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No datastores configured
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dependency Graph</CardTitle>
              <CardDescription>
                Visual representation of dependencies for {application.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DependencyGraph applicationId={application.id} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'vulnerabilities' && (
        <VulnerabilityPanel applicationId={application.id} />
      )}

      {activeTab === 'known-issues' && (
        <KnownIssuesTab
          applicationId={application.id}
          ownerTeam={application.owner.team}
        />
      )}
    </div>
  )
}
