// ABOUTME: TypeScript type definitions for Release Monitor feature.
// ABOUTME: Defines update sources, categories, impact levels, and release update structure.

export type UpdateSource =
  | 'AWS'
  | 'Kubernetes'
  | 'MongoDB'
  | 'PostgreSQL'
  | 'Prometheus'
  | 'Grafana'
  | 'Instana'
  | 'GitHub'
  | 'Java'
  | 'Python'
  | 'Node.js'
  | 'Go'
  | '.NET'
  | 'Spring Boot'
  | 'React'
  | 'Internal Platform'
  | 'Security Advisory'

export type UpdateCategory =
  | 'Feature'
  | 'Bugfix'
  | 'Patch'
  | 'Security'
  | 'Breaking Change'
  | 'Deprecation'
  | 'EOL'

export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low'

export interface ReleaseUpdate {
  id: string
  source: UpdateSource
  category: UpdateCategory
  impact: ImpactLevel
  title: string
  summary: string
  tags: string[]
  link: string
  publishedAt: string
  relevantTo?: string[]  // Application IDs this update is relevant to
}

export interface UserPreferences {
  followedSources: UpdateSource[]
  readUpdates: string[]  // Update IDs
}
