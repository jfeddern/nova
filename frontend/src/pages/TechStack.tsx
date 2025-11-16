// ABOUTME: Tech Stack tab component integrating all SBOM and dependency insights.
// ABOUTME: Displays comprehensive view of application dependencies, runtimes, and security status.

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTechStack } from '@/services/techstackService'
import { TechStackSummary } from '@/components/techstack/TechStackSummary'
import { RuntimeOverview } from '@/components/techstack/RuntimeOverview'
import { FrameworksOverview } from '@/components/techstack/FrameworksOverview'
import { TopIssuesList } from '@/components/techstack/TopIssuesList'
import { DependencyTable } from '@/components/techstack/DependencyTable'
import { DependencyDetailsDrawer } from '@/components/techstack/DependencyDetailsDrawer'
import { SbomTimeline } from '@/components/techstack/SbomTimeline'
import { DiffViewer } from '@/components/techstack/DiffViewer'
import type { TechStackData, Component } from '@/types/techstack'
import { AlertCircle, FileSearch } from 'lucide-react'

export function TechStack() {
  const { id } = useParams<{ id: string }>()
  const [techstack, setTechstack] = useState<TechStackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const data = await getTechStack(id)
        setTechstack(data)
      } catch (error) {
        console.error('Failed to fetch tech stack data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-accent/50 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-accent/50 rounded-lg" />
          <div className="h-48 bg-accent/50 rounded-lg" />
        </div>
        <div className="h-96 bg-accent/50 rounded-lg" />
      </div>
    )
  }

  if (!techstack) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FileSearch className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No SBOM available yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          To enable Tech Stack insights, connect your CI pipeline to automatically upload Software Bill of Materials
          (SBOM) files.
        </p>
        <button className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Show Integration Guide
        </button>
      </div>
    )
  }

  const isPartialData = techstack.components.total === 0 && techstack.runtimes.length > 0

  return (
    <div className="space-y-6">
      <TechStackSummary data={techstack} />

      {isPartialData && (
        <div className="flex items-start gap-3 p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Partial SBOM Data</h4>
            <p className="text-sm text-muted-foreground mt-1">
              This SBOM does not include component dependencies. Ask your team to enable full SBOM generation in your
              build pipeline.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RuntimeOverview runtimes={techstack.runtimes} />
        <FrameworksOverview frameworks={techstack.frameworks} />
      </div>

      {techstack.topIssues.length > 0 && <TopIssuesList issues={techstack.topIssues} />}

      {techstack.components.total > 0 && (
        <DependencyTable
          components={techstack.components.records}
          onViewDetails={(component) => setSelectedComponent(component)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SbomTimeline timeline={techstack.timeline} />
        <DiffViewer diff={techstack.diff} />
      </div>

      <DependencyDetailsDrawer component={selectedComponent} onClose={() => setSelectedComponent(null)} />
    </div>
  )
}
