
export interface Cluster {
  id: string
  name: string
  environment: string
  region?: string
  provider: string
  created_at: string
}

export interface ToolDeployment {
  cluster: string
  version: string
  installed_at: string
  status: ToolStatus
  vulnerabilities?: number
}

export type ToolStatus = 'up_to_date' | 'update_available' | 'outdated' | 'vulnerable'

export type ToolCategory =
  | 'Security'
  | 'Observability'
  | 'Logging'
  | 'Networking'
  | 'CI/CD'
  | 'GitOps'
  | 'Policy'
  | 'DNS'
  | 'Secrets'

export interface LatestRelease {
  version: string
  release_date: string
  changelog_url: string
}

export interface PlatformTool {
  id: string
  name: string
  description: string
  category: ToolCategory
  current_versions: ToolDeployment[]
  latest_release: LatestRelease
  owner_team: string
  repository_url: string
  chart_repo?: string
  license?: string
  maintainer?: string
}
