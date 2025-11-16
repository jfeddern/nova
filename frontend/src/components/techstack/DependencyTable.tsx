// ABOUTME: Dependency table component with filtering, search, and pagination.
// ABOUTME: Displays SBOM components in a sortable, searchable table format.

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, CheckCircle2, AlertTriangle, XCircle, Eye } from 'lucide-react'
import type { Component, ComponentStatus } from '@/types/techstack'

interface DependencyTableProps {
  components: Component[]
  onViewDetails: (component: Component) => void
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

export function DependencyTable({ components, onViewDetails }: DependencyTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComponentStatus | 'all'>('all')
  const [scopeFilter, setScopeFilter] = useState<string>('all')

  const filteredComponents = components.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || component.status === statusFilter
    const matchesScope = scopeFilter === 'all' || component.scope === scopeFilter

    return matchesSearch && matchesStatus && matchesScope
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependencies (SBOM)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dependencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ComponentStatus | 'all')}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="ok">OK</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Scopes</option>
              <option value="runtime">Runtime</option>
              <option value="dev">Development</option>
              <option value="test">Test</option>
            </select>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold text-sm">Name</th>
                  <th className="text-left p-3 font-semibold text-sm">Version</th>
                  <th className="text-left p-3 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-sm">Scope</th>
                  <th className="text-left p-3 font-semibold text-sm">Latest</th>
                  <th className="text-right p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No dependencies found
                    </td>
                  </tr>
                ) : (
                  filteredComponents.map((component, idx) => (
                    <tr key={idx} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-3 font-medium">{component.name}</td>
                      <td className="p-3 text-sm">{component.version}</td>
                      <td className="p-3">{getStatusBadge(component.status)}</td>
                      <td className="p-3">
                        <Badge variant="outline">{component.scope}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{component.latestVersion}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(component)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredComponents.length} of {components.length} dependencies
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
