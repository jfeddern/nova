import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LayoutGrid, Users, Search, GitBranch } from 'lucide-react'

export function About() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">About Nova</h1>
        <p className="text-lg text-muted-foreground">
          Application & Service Catalog Management Platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purpose</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Nova provides a central overview of all applications and services
            within the organization. It enables teams to discover, understand, and manage their
            application landscape efficiently.
          </p>
          <p>
            Whether you're a developer looking for service dependencies, a team lead managing
            ownership, or an architect exploring the system architecture, this portal serves as
            your single source of truth.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Application Catalog
            </CardTitle>
            <CardDescription>Discover and explore services</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Browse all applications and microservices in the organization with detailed metadata,
              ownership information, and documentation links.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Management
            </CardTitle>
            <CardDescription>View applications by team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Organize and view applications grouped by owning teams, making it easy to understand
              team responsibilities and contact the right people.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search & Filter
            </CardTitle>
            <CardDescription>Find what you need quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Powerful search and filtering capabilities allow you to find applications by name,
              team, department, tags, criticality, and more.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Dependency Visualization
            </CardTitle>
            <CardDescription>Understand system architecture</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Interactive dependency graphs help you visualize how services connect, understand
              impact of changes, and identify critical paths in your architecture.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Version:</span>
            <span>1.0.0 (MVP)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Release Date:</span>
            <span>2025</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="text-green-600 font-medium">Active Development</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
