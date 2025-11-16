// ABOUTME: Update card component displaying individual release update information.
// ABOUTME: Shows source, category, impact, summary, tags, and actions (mark as read, follow, external link).

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ReleaseUpdate } from '@/types/release'
import { ExternalLink, Check, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface UpdateCardProps {
  update: ReleaseUpdate
  isRead: boolean
  isFollowing: boolean
  onMarkAsRead: () => void
  onToggleFollow: () => void
  relevanceReason?: string[]
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'critical':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'medium':
      return 'bg-yellow-500 text-white'
    case 'low':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Security':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'Breaking Change':
    case 'Deprecation':
    case 'EOL':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    case 'Feature':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'Bugfix':
    case 'Patch':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

export function UpdateCard({
  update,
  isRead,
  isFollowing,
  onMarkAsRead,
  onToggleFollow,
  relevanceReason,
}: UpdateCardProps) {
  return (
    <Card className={`transition-all ${isRead ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-semibold">
              {update.source}
            </Badge>
            <Badge className={getCategoryColor(update.category)}>{update.category}</Badge>
            <Badge className={`${getImpactColor(update.impact)} text-xs uppercase`}>
              Impact: {update.impact}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(update.publishedAt), { addSuffix: true })}
          </span>
        </div>

        <h3 className="text-lg font-semibold mb-2">{update.title}</h3>

        <p className="text-sm text-muted-foreground mb-3">{update.summary}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {update.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {relevanceReason && relevanceReason.length > 0 && (
          <div className="mb-3 p-2 bg-primary/5 border border-primary/20 rounded-md">
            <p className="text-xs font-semibold text-primary mb-1">Relevant because:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {relevanceReason.map((reason, idx) => (
                <li key={idx}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={update.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Read more
          </a>

          <Button
            size="sm"
            variant={isFollowing ? 'default' : 'outline'}
            onClick={onToggleFollow}
            className="gap-1"
          >
            <Star className={`h-3 w-3 ${isFollowing ? 'fill-current' : ''}`} />
            {isFollowing ? 'Following' : 'Follow'}
          </Button>

          {!isRead && (
            <Button size="sm" variant="ghost" onClick={onMarkAsRead} className="gap-1">
              <Check className="h-3 w-3" />
              Mark as read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
