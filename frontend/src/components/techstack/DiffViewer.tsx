// ABOUTME: Diff viewer component showing changes between SBOM versions.
// ABOUTME: Displays added, removed, and updated dependencies with visual indicators.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, ArrowRight } from 'lucide-react'
import type { DiffData } from '@/types/techstack'

interface DiffViewerProps {
  diff: DiffData | null
}

export function DiffViewer({ diff }: DiffViewerProps) {
  if (!diff) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No diff data available</p>
        </CardContent>
      </Card>
    )
  }

  const hasChanges = diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Changes from {diff.from} to {diff.to}
        </p>
      </CardHeader>
      <CardContent>
        {!hasChanges ? (
          <p className="text-muted-foreground text-center py-8">No changes detected</p>
        ) : (
          <div className="space-y-4">
            {diff.added.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-500" />
                  Added ({diff.added.length})
                </h4>
                <div className="space-y-1">
                  {diff.added.map((dep, idx) => (
                    <div
                      key={idx}
                      className="text-sm p-2 rounded bg-green-50 dark:bg-green-900/10 border-l-2 border-green-500"
                    >
                      <code className="font-mono">{dep}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diff.removed.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Minus className="h-4 w-4 text-red-500" />
                  Removed ({diff.removed.length})
                </h4>
                <div className="space-y-1">
                  {diff.removed.map((dep, idx) => (
                    <div
                      key={idx}
                      className="text-sm p-2 rounded bg-red-50 dark:bg-red-900/10 border-l-2 border-red-500"
                    >
                      <code className="font-mono">{dep}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diff.changed.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-yellow-500" />
                  Updated ({diff.changed.length})
                </h4>
                <div className="space-y-1">
                  {diff.changed.map((change, idx) => (
                    <div
                      key={idx}
                      className="text-sm p-2 rounded bg-yellow-50 dark:bg-yellow-900/10 border-l-2 border-yellow-500"
                    >
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-semibold">{change.name}</code>
                        <span className="text-muted-foreground">
                          {change.from} → {change.to}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
