import { X, Copy, Edit, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { KnownIssue } from '../../types/knownIssue'
import { useState } from 'react'

interface IssueDetailsDrawerProps {
  issue: KnownIssue | null
  onClose: () => void
  onEdit: (issue: KnownIssue) => void
  onDelete: (issueId: string) => void
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

export default function IssueDetailsDrawer({
  issue,
  onClose,
  onEdit,
  onDelete,
}: IssueDetailsDrawerProps) {
  const [copied, setCopied] = useState(false)

  if (!issue) return null

  const copyToClipboard = () => {
    const text = `
**${issue.title}**

Severity: ${issue.severity}
Category: ${issue.category}

**Symptoms:**
${issue.symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Possible Causes:**
${issue.possible_causes.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**Resolution Steps:**
${issue.resolution_steps.map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Affected Components:** ${issue.affected_components.join(', ')}
**Owner:** ${issue.owner_team}
**Tags:** ${issue.tags.join(', ')}
${issue.related_tickets ? `**Related Tickets:** ${issue.related_tickets.join(', ')}` : ''}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this issue: "${issue.title}"?`)) {
      onDelete(issue.id)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold text-card-foreground">Issue Details</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {issue.title}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(
                      issue.severity
                    )}`}
                  >
                    {getSeverityEmoji(issue.severity)} {issue.severity}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {issue.category}
                  </span>
                  {issue.resolution_confidence && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {issue.resolution_confidence}% Success Rate
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              <p>
                <strong>Owner:</strong> {issue.owner_team}
              </p>
              <p>
                <strong>Last Updated:</strong>{' '}
                {new Date(issue.last_updated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {issue.affected_components.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Affected Components
              </h4>
              <div className="flex flex-wrap gap-2">
                {issue.affected_components.map((component) => (
                  <span
                    key={component}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                  >
                    {component}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Symptoms
            </h4>
            <ul className="space-y-2">
              {issue.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-foreground pt-0.5">{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Possible Causes
            </h4>
            <ul className="space-y-2">
              {issue.possible_causes.map((cause, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-foreground pt-0.5">{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolution Steps
            </h4>
            <ul className="space-y-2">
              {issue.resolution_steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {issue.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {issue.related_tickets && issue.related_tickets.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Related Tickets
              </h4>
              <div className="flex flex-wrap gap-2">
                {issue.related_tickets.map((ticket) => (
                  <span
                    key={ticket}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono"
                  >
                    {ticket}
                  </span>
                ))}
              </div>
            </div>
          )}

          </div>

          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              onClick={() => onEdit(issue)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
