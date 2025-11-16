// ABOUTME: Frameworks overview component displaying framework versions and status.
// ABOUTME: Shows frameworks like Spring Boot, React, FastAPI with health indicators.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { Framework, ComponentStatus } from '@/types/techstack'

interface FrameworksOverviewProps {
  frameworks: Framework[]
}

const getStatusBadge = (status: ComponentStatus) => {
  switch (status) {
    case 'ok':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
          <CheckCircle2 className="h-3 w-3" />
          OK
        </Badge>
      )
    case 'warning':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white gap-1">
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Badge>
      )
    case 'critical':
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white gap-1">
          <XCircle className="h-3 w-3" />
          Critical
        </Badge>
      )
  }
}

export function FrameworksOverview({ frameworks }: FrameworksOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frameworks & Tooling</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {frameworks.map((framework, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-semibold">{framework.name}</h4>
                <p className="text-sm text-muted-foreground">v{framework.version}</p>
              </div>
              {getStatusBadge(framework.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
