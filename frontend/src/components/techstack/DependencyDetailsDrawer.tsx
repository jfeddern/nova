// ABOUTME: Dependency details drawer component displaying comprehensive package information.
// ABOUTME: Shows PURL, version info, vulnerabilities, and recommendations in a slide-in panel.

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Package, AlertTriangle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import type { Component } from '@/types/techstack'

interface DependencyDetailsDrawerProps {
  component: Component | null
  onClose: () => void
}

export function DependencyDetailsDrawer({ component, onClose }: DependencyDetailsDrawerProps) {
  if (!component) return null

  const isOpen = component !== null

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Dependency Details</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{component.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">v{component.version}</Badge>
                {component.status === 'ok' && (
                  <Badge className="bg-green-500 text-white gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    OK
                  </Badge>
                )}
                {component.status === 'warning' && (
                  <Badge className="bg-yellow-500 text-white gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Warning
                  </Badge>
                )}
                {component.status === 'critical' && (
                  <Badge className="bg-red-500 text-white gap-1">
                    <XCircle className="h-3 w-3" />
                    Critical
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Package URL (PURL)</h4>
                <code className="text-xs bg-accent p-2 rounded block break-all">{component.purl}</code>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Current Version</h4>
                  <p className="font-medium">{component.version}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Latest Version</h4>
                  <p className="font-medium">{component.latestVersion}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Scope</h4>
                <Badge variant="outline">{component.scope}</Badge>
              </div>
            </div>

            {component.issues.length > 0 && (
              <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/10">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Known Issues
                </h4>
                <ul className="space-y-1">
                  {component.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {component.version !== component.latestVersion && (
              <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                <h4 className="font-semibold mb-2">Recommended Action</h4>
                <p className="text-sm mb-3">
                  A newer version ({component.latestVersion}) is available. Consider upgrading to get the latest
                  features and security fixes.
                </p>
                <Button size="sm" className="gap-2">
                  <ExternalLink className="h-3 w-3" />
                  View Release Notes
                </Button>
              </div>
            )}

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Additional Information</h4>
              <p className="text-sm text-muted-foreground">
                This component is part of your application's {component.scope} dependencies. For more details, check
                the package repository or documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
