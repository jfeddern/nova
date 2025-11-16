// ABOUTME: SBOM timeline component showing history of dependency scans and uploads.
// ABOUTME: Displays chronological view of SBOM ingestions with issue counts.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, XCircle, Clock } from 'lucide-react'
import type { TimelineEntry } from '@/types/techstack'

interface SbomTimelineProps {
  timeline: TimelineEntry[]
}

export function SbomTimeline({ timeline }: SbomTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SBOM Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((entry, idx) => (
            <div key={entry.uploadId} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
                {idx < timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs bg-accent px-2 py-0.5 rounded font-mono">
                        {entry.commit.substring(0, 7)}
                      </code>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {entry.critical > 0 && (
                        <Badge className="bg-red-500 text-white gap-1 text-xs">
                          <XCircle className="h-3 w-3" />
                          {entry.critical} Critical
                        </Badge>
                      )}
                      {entry.warnings > 0 && (
                        <Badge className="bg-yellow-500 text-white gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          {entry.warnings} Warnings
                        </Badge>
                      )}
                      {entry.critical === 0 && entry.warnings === 0 && (
                        <Badge className="bg-green-500 text-white text-xs">No Issues</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
