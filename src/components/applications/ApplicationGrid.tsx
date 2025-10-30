import { Link } from 'react-router-dom'
import { Application } from '@/types/application'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, ArrowRight } from 'lucide-react'

interface ApplicationGridProps {
  applications: Application[]
}

export function ApplicationGrid({ applications }: ApplicationGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {applications.map((app) => (
        <Link key={app.id} to={`/applications/${app.id}`} className="group">
          <Card className="h-full transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                  {app.name}
                </CardTitle>
                <Badge
                  variant={
                    app.criticality === 'P1'
                      ? 'destructive'
                      : app.criticality === 'P2'
                        ? 'warning'
                        : 'secondary'
                  }
                >
                  {app.criticality}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-base">{app.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{app.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{app.owner.team}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
