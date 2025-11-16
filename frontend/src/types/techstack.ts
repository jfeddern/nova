// ABOUTME: TypeScript types for Tech Stack and SBOM data structures.
// ABOUTME: Defines interfaces for components, runtimes, frameworks, and dependency metadata.

export type HealthStatus = 'ok' | 'warning' | 'critical'
export type ComponentStatus = 'ok' | 'warning' | 'critical'
export type RuntimeStatus = 'ok' | 'eol_soon' | 'eol'
export type ComponentScope = 'runtime' | 'dev' | 'test'

export interface TechStackSummary {
  health: HealthStatus
  criticalCount: number
  warningCount: number
  totalDependencies: number
}

export interface Runtime {
  language: string
  runtime: string
  version: string
  status: RuntimeStatus
  eolDate: string
  notes: string
}

export interface Framework {
  name: string
  version: string
  status: ComponentStatus
}

export interface TopIssue {
  component: string
  version: string
  status: ComponentStatus
  reason: string
  recommendation: string
}

export interface Component {
  name: string
  version: string
  scope: ComponentScope
  purl: string
  status: ComponentStatus
  issues: string[]
  latestVersion: string
}

export interface ComponentPage {
  page: number
  pageSize: number
  total: number
  records: Component[]
}

export interface TimelineEntry {
  uploadId: string
  timestamp: string
  commit: string
  warnings: number
  critical: number
}

export interface VersionChange {
  name: string
  from: string
  to: string
}

export interface DiffData {
  from: string
  to: string
  added: string[]
  removed: string[]
  changed: VersionChange[]
}

export interface TechStackData {
  appId: string
  lastIngestion: string
  commit: string
  pipelineUrl: string
  summary: TechStackSummary
  runtimes: Runtime[]
  frameworks: Framework[]
  topIssues: TopIssue[]
  components: ComponentPage
  timeline: TimelineEntry[]
  diff: DiffData | null
}
