// ABOUTME: Runtime overview component displaying runtime versions and EOL status.
// ABOUTME: Shows language, runtime version, and support lifecycle information.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { Runtime, RuntimeStatus } from '@/types/techstack'

interface RuntimeOverviewProps {
  runtimes: Runtime[]
}

const getStatusBadge = (status: RuntimeStatus) => {
  switch (status) {
    case 'ok':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Supported
        </Badge>
      )
    case 'eol_soon':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white gap-1">
          <AlertTriangle className="h-3 w-3" />
          EOL Soon
        </Badge>
      )
    case 'eol':
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white gap-1">
          <XCircle className="h-3 w-3" />
          End of Life
        </Badge>
      )
  }
}

export function RuntimeOverview({ runtimes }: RuntimeOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtimes & Platforms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {runtimes.map((runtime, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{runtime.runtime}</h3>
                  {getStatusBadge(runtime.status)}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium">Language:</span> {runtime.language}
                  </p>
                  <p>
                    <span className="font-medium">Version:</span> {runtime.version}
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">EOL Date:</span>
                    <span>{new Date(runtime.eolDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {runtime.notes && (
                  <div className="mt-3 p-2 bg-accent/50 rounded text-sm">
                    {runtime.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
