import knownIssuesData from '../data/knownIssues.json'
import { KnownIssue, IssueCategory, IssueSeverity } from '../types/knownIssue'

let mockIssues: KnownIssue[] = [...knownIssuesData as KnownIssue[]]

export const knownIssueService = {
  getAllIssues(): KnownIssue[] {
    return mockIssues
  },

  getIssuesByApplicationId(applicationId: string): KnownIssue[] {
    return mockIssues.filter((issue) => issue.application_id === applicationId)
  },

  getIssueById(issueId: string): KnownIssue | undefined {
    return mockIssues.find((issue) => issue.id === issueId)
  },

  searchIssues(applicationId: string, query: string): KnownIssue[] {
    const issues = this.getIssuesByApplicationId(applicationId)
    if (!query.trim()) {
      return issues
    }

    const lowerQuery = query.toLowerCase()
    return issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(lowerQuery) ||
        issue.symptoms.some((s) => s.toLowerCase().includes(lowerQuery)) ||
        issue.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
        issue.category.toLowerCase().includes(lowerQuery)
    )
  },

  filterIssues(
    applicationId: string,
    filters: {
      severity?: IssueSeverity[]
      category?: IssueCategory[]
      search?: string
    }
  ): KnownIssue[] {
    let issues = this.getIssuesByApplicationId(applicationId)

    if (filters.search) {
      issues = this.searchIssues(applicationId, filters.search)
    }

    if (filters.severity && filters.severity.length > 0) {
      issues = issues.filter((issue) => filters.severity!.includes(issue.severity))
    }

    if (filters.category && filters.category.length > 0) {
      issues = issues.filter((issue) => filters.category!.includes(issue.category))
    }

    return issues
  },

  createIssue(issue: Omit<KnownIssue, 'id' | 'last_updated'>): KnownIssue {
    const newIssue: KnownIssue = {
      ...issue,
      id: `issue-${Date.now()}`,
      last_updated: new Date().toISOString(),
    }
    mockIssues.push(newIssue)
    return newIssue
  },

  updateIssue(issueId: string, updates: Partial<KnownIssue>): KnownIssue | null {
    const index = mockIssues.findIndex((issue) => issue.id === issueId)
    if (index === -1) {
      return null
    }

    mockIssues[index] = {
      ...mockIssues[index],
      ...updates,
      id: issueId,
      last_updated: new Date().toISOString(),
    }

    return mockIssues[index]
  },

  deleteIssue(issueId: string): boolean {
    const index = mockIssues.findIndex((issue) => issue.id === issueId)
    if (index === -1) {
      return false
    }

    mockIssues.splice(index, 1)
    return true
  },

  getCategories(): IssueCategory[] {
    return [
      'Authentication',
      'Performance',
      'Integration',
      'Database',
      'Network',
      'Configuration',
      'Security',
      'UI/UX',
      'Backend',
      'Infrastructure',
    ]
  },

  getSeverities(): IssueSeverity[] {
    return ['Low', 'Medium', 'High', 'Critical']
  },
}
