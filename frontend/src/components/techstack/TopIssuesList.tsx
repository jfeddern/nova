// ABOUTME: Top issues list component highlighting critical vulnerabilities and problems.
// ABOUTME: Displays actionable recommendations for the most important dependency issues.

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react'
import type { TopIssue, ComponentStatus } from '@/types/techstack'

interface TopIssuesListProps {
  issues: TopIssue[]
}

const getStatusIcon = (status: ComponentStatus) => {
  switch (status) {
    case 'critical':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    default:
      return null
  }
}

const getStatusBadge = (status: ComponentStatus) => {
  switch (status) {
    case 'critical':
      return <Badge className="bg-red-500 hover:bg-red-600 text-white">Critical</Badge>
    case 'warning':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Warning</Badge>
    default:
      return <Badge>OK</Badge>
  }
}

export function TopIssuesList({ issues }: TopIssuesListProps) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Issues</CardTitle>
          <CardDescription>Critical vulnerabilities and important problems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No critical issues found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Issues</CardTitle>
        <CardDescription>Critical vulnerabilities and important problems</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issues.map((issue, idx) => (
            <div key={idx} className="flex gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex-shrink-0 mt-0.5">{getStatusIcon(issue.status)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold">{issue.component}</h4>
                    <p className="text-sm text-muted-foreground">v{issue.version}</p>
                  </div>
                  {getStatusBadge(issue.status)}
                </div>
                <p className="text-sm">{issue.reason}</p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium">{issue.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// eslint-disable-next-line no-undef
function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
