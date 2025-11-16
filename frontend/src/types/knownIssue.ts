
export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical'

export type IssueCategory =
  | 'Authentication'
  | 'Performance'
  | 'Integration'
  | 'Database'
  | 'Network'
  | 'Configuration'
  | 'Security'
  | 'UI/UX'
  | 'Backend'
  | 'Infrastructure'

export interface KnownIssue {
  id: string
  application_id: string
  title: string
  symptoms: string[]
  possible_causes: string[]
  resolution_steps: string[]
  severity: IssueSeverity
  category: IssueCategory
  affected_components: string[]
  tags: string[]
  owner_team: string
  last_updated: string
  related_tickets?: string[]
  resolution_confidence?: number
}
