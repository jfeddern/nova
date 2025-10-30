import { useState, useMemo } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import { KnownIssue, IssueCategory, IssueSeverity } from '../../types/knownIssue'
import { knownIssueService } from '../../services/knownIssueService'
import IssueDetailsDrawer from './IssueDetailsDrawer'
import AddEditIssueDialog from './AddEditIssueDialog'

interface KnownIssuesTabProps {
  applicationId: string
  ownerTeam: string
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    case 'High':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
    case 'Medium':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    case 'Low':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

const getSeverityEmoji = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return '🔴'
    case 'High':
      return '🟠'
    case 'Medium':
      return '🟡'
    case 'Low':
      return '🟢'
    default:
      return '⚪'
  }
}

export default function KnownIssuesTab({
  applicationId,
  ownerTeam,
}: KnownIssuesTabProps) {
  const [issues, setIssues] = useState<KnownIssue[]>(
    knownIssueService.getIssuesByApplicationId(applicationId)
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverities, setSelectedSeverities] = useState<IssueSeverity[]>([])
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([])
  const [selectedIssue, setSelectedIssue] = useState<KnownIssue | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState<KnownIssue | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredIssues = useMemo(() => {
    return knownIssueService.filterIssues(applicationId, {
      search: searchQuery,
      severity: selectedSeverities,
      category: selectedCategories,
    })
  }, [applicationId, searchQuery, selectedSeverities, selectedCategories])

  const handleIssueClick = (issue: KnownIssue) => {
    setSelectedIssue(issue)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedIssue(null)
  }

  const handleAddIssue = () => {
    setEditingIssue(null)
    setIsDialogOpen(true)
  }

  const handleEditIssue = (issue: KnownIssue) => {
    setEditingIssue(issue)
    setIsDialogOpen(true)
    setIsDrawerOpen(false)
  }

  const handleSaveIssue = (issue: KnownIssue) => {
    setIssues(knownIssueService.getIssuesByApplicationId(applicationId))
    setIsDialogOpen(false)
    setEditingIssue(null)
  }

  const handleDeleteIssue = (issueId: string) => {
    knownIssueService.deleteIssue(issueId)
    setIssues(knownIssueService.getIssuesByApplicationId(applicationId))
    setIsDrawerOpen(false)
    setSelectedIssue(null)
  }

  const toggleSeverity = (severity: IssueSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    )
  }

  const toggleCategory = (category: IssueCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSelectedSeverities([])
    setSelectedCategories([])
    setSearchQuery('')
  }

  const activeFiltersCount =
    selectedSeverities.length + selectedCategories.length + (searchQuery ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search by keyword, error code, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex gap-3 ml-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200'
                : 'border-input text-foreground hover:bg-muted'
            }`}
          >
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={handleAddIssue}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Issue
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted border border-input rounded-lg p-4 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Severity</h4>
            <div className="flex flex-wrap gap-2">
              {knownIssueService.getSeverities().map((severity) => (
                <button
                  key={severity}
                  onClick={() => toggleSeverity(severity)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSeverities.includes(severity)
                      ? getSeverityColor(severity)
                      : 'bg-background border border-input text-foreground hover:bg-muted'
                  }`}
                >
                  {getSeverityEmoji(severity)} {severity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Category</h4>
            <div className="flex flex-wrap gap-2">
              {knownIssueService.getCategories().map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-background border border-input text-foreground hover:bg-muted'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {filteredIssues.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg border border-input">
          <p className="text-muted-foreground mb-4">
            {issues.length === 0
              ? 'No known issues documented yet.'
              : 'No issues match your search criteria.'}
          </p>
          {issues.length === 0 && (
            <button
              onClick={handleAddIssue}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add First Issue
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-input rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Issue Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Owner
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => handleIssueClick(issue)}
                  className="hover:bg-muted cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">
                      {issue.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {issue.symptoms.length} symptom
                      {issue.symptoms.length !== 1 ? 's' : ''} •{' '}
                      {issue.resolution_steps.length} step
                      {issue.resolution_steps.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                        issue.severity
                      )}`}
                    >
                      {getSeverityEmoji(issue.severity)} {issue.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {issue.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(issue.last_updated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {issue.owner_team}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <IssueDetailsDrawer
        issue={selectedIssue}
        onClose={handleCloseDrawer}
        onEdit={handleEditIssue}
        onDelete={handleDeleteIssue}
      />

      <AddEditIssueDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingIssue(null)
        }}
        onSave={handleSaveIssue}
        applicationId={applicationId}
        ownerTeam={ownerTeam}
        editIssue={editingIssue}
      />
    </div>
  )
}
