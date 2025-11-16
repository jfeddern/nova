// ABOUTME: Critical updates panel highlighting high-priority release announcements.
// ABOUTME: Collapsible panel displaying top 5 critical and high-impact updates at the top of the Release Monitor page.

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import type { ReleaseUpdate } from '@/types/release'
import { formatDistanceToNow } from 'date-fns'

interface CriticalUpdatesPanelProps {
  updates: ReleaseUpdate[]
}

export function CriticalUpdatesPanel({ updates }: CriticalUpdatesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (updates.length === 0) {
    return null
  }

  const criticalCount = updates.filter((u) => u.impact === 'critical').length
  const highCount = updates.filter((u) => u.impact === 'high').length

  // Collapsed state - just a banner
  if (!isExpanded) {
    return (
      <Card className="border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <h3 className="font-semibold text-orange-700 dark:text-orange-400">
                  {updates.length} Critical Update{updates.length !== 1 ? 's' : ''} Requiring Attention
                </h3>
                <p className="text-xs text-muted-foreground">
                  {criticalCount > 0 && `${criticalCount} critical`}
                  {criticalCount > 0 && highCount > 0 && ', '}
                  {highCount > 0 && `${highCount} high priority`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="gap-1"
            >
              Show details
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Expanded state - full cards
  return (
    <Card className="border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-900/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <AlertTriangle className="h-5 w-5" />
            Critical Updates Requiring Attention
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="gap-1"
          >
            Collapse
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          High-priority updates that may require immediate action
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {updates.slice(0, 5).map((update) => (
          <div
            key={update.id}
            className="p-3 bg-background border rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-semibold text-xs">
                  {update.source}
                </Badge>
                <Badge
                  className={`text-xs uppercase ${
                    update.impact === 'critical'
                      ? 'bg-red-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}
                >
                  {update.impact}
                </Badge>
                {(update.category === 'Security' ||
                  update.category === 'EOL' ||
                  update.category === 'Breaking Change') && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  >
                    {update.category}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(update.publishedAt), { addSuffix: true })}
              </span>
            </div>

            <h4 className="font-semibold mb-1 text-sm">{update.title}</h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{update.summary}</p>

            <a
              href={update.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
