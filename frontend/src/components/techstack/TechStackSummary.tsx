// ABOUTME: Summary card component displaying overall tech stack health status.
// ABOUTME: Shows last ingestion time, CI source, and health metrics.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Clock, GitCommit, XCircle } from 'lucide-react'
import type { TechStackData, HealthStatus } from '@/types/techstack'

interface TechStackSummaryProps {
  data: TechStackData
}

const getHealthBadge = (health: HealthStatus) => {
  switch (health) {
    case 'ok':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Healthy
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

const getHealthMessage = (data: TechStackData): string => {
  const { health, criticalCount, warningCount } = data.summary

  if (health === 'ok') {
    return '✔ All dependencies look healthy'
  } else if (health === 'critical') {
    return `❗ ${criticalCount} critical ${criticalCount === 1 ? 'issue' : 'issues'} found`
  } else {
    return `⚠ ${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'} found`
  }
}

export function TechStackSummary({ data }: TechStackSummaryProps) {
  const lastIngestion = new Date(data.lastIngestion)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tech Stack Health</span>
          {getHealthBadge(data.summary.health)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-sm font-medium">{getHealthMessage(data)}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Dependencies</p>
            <p className="text-2xl font-bold">{data.summary.totalDependencies}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="text-2xl font-bold text-yellow-600">{data.summary.warningCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{data.summary.criticalCount}</p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last updated:</span>
            <span className="font-medium">{lastIngestion.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GitCommit className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Commit:</span>
            <code className="font-mono text-xs bg-accent px-2 py-0.5 rounded">{data.commit}</code>
          </div>
          {data.pipelineUrl && (
            <div className="text-sm">
              <a
                href={data.pipelineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View CI Pipeline →
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
