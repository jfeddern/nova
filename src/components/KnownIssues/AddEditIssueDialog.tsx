import { X, Plus, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { KnownIssue, IssueCategory, IssueSeverity } from '../../types/knownIssue'
import { knownIssueService } from '../../services/knownIssueService'

interface AddEditIssueDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (issue: KnownIssue) => void
  applicationId: string
  ownerTeam: string
  editIssue?: KnownIssue | null
}

export default function AddEditIssueDialog({
  isOpen,
  onClose,
  onSave,
  applicationId,
  ownerTeam,
  editIssue,
}: AddEditIssueDialogProps) {
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<IssueSeverity>('Medium')
  const [category, setCategory] = useState<IssueCategory>('Backend')
  const [symptoms, setSymptoms] = useState<string[]>([''])
  const [possibleCauses, setPossibleCauses] = useState<string[]>([''])
  const [resolutionSteps, setResolutionSteps] = useState<string[]>([''])
  const [affectedComponents, setAffectedComponents] = useState<string[]>([''])
  const [tags, setTags] = useState('')
  const [relatedTickets, setRelatedTickets] = useState('')
  const [resolutionConfidence, setResolutionConfidence] = useState<number>(0)

  useEffect(() => {
    if (editIssue) {
      setTitle(editIssue.title)
      setSeverity(editIssue.severity)
      setCategory(editIssue.category)
      setSymptoms(editIssue.symptoms.length > 0 ? editIssue.symptoms : [''])
      setPossibleCauses(
        editIssue.possible_causes.length > 0 ? editIssue.possible_causes : ['']
      )
      setResolutionSteps(
        editIssue.resolution_steps.length > 0 ? editIssue.resolution_steps : ['']
      )
      setAffectedComponents(
        editIssue.affected_components.length > 0
          ? editIssue.affected_components
          : ['']
      )
      setTags(editIssue.tags.join(', '))
      setRelatedTickets(editIssue.related_tickets?.join(', ') || '')
      setResolutionConfidence(editIssue.resolution_confidence || 0)
    } else {
      resetForm()
    }
  }, [editIssue, isOpen])

  const resetForm = () => {
    setTitle('')
    setSeverity('Medium')
    setCategory('Backend')
    setSymptoms([''])
    setPossibleCauses([''])
    setResolutionSteps([''])
    setAffectedComponents([''])
    setTags('')
    setRelatedTickets('')
    setResolutionConfidence(0)
  }

  const handleArrayChange = (
    index: number,
    value: string,
    array: string[],
    setter: (arr: string[]) => void
  ) => {
    const newArray = [...array]
    newArray[index] = value
    setter(newArray)
  }

  const handleAddField = (array: string[], setter: (arr: string[]) => void) => {
    setter([...array, ''])
  }

  const handleRemoveField = (
    index: number,
    array: string[],
    setter: (arr: string[]) => void
  ) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index)
      setter(newArray)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const issueData = {
      application_id: applicationId,
      title: title.trim(),
      symptoms: symptoms.filter((s) => s.trim() !== ''),
      possible_causes: possibleCauses.filter((c) => c.trim() !== ''),
      resolution_steps: resolutionSteps.filter((r) => r.trim() !== ''),
      severity,
      category,
      affected_components: affectedComponents.filter((c) => c.trim() !== ''),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== ''),
      owner_team: ownerTeam,
      related_tickets: relatedTickets
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== ''),
      resolution_confidence: resolutionConfidence > 0 ? resolutionConfidence : undefined,
    }

    if (editIssue) {
      const updated = knownIssueService.updateIssue(editIssue.id, issueData)
      if (updated) {
        onSave(updated)
      }
    } else {
      const created = knownIssueService.createIssue(issueData)
      onSave(created)
    }

    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold text-card-foreground">
              {editIssue ? 'Edit Issue' : 'Add New Issue'}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Severity *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {knownIssueService.getSeverities().map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {knownIssueService.getCategories().map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Symptoms *
                </label>
                {symptoms.map((symptom, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={symptom}
                      onChange={(e) =>
                        handleArrayChange(index, e.target.value, symptoms, setSymptoms)
                      }
                      required
                      className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Symptom ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(index, symptoms, setSymptoms)}
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddField(symptoms, setSymptoms)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Symptom
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Possible Causes *
                </label>
                {possibleCauses.map((cause, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={cause}
                      onChange={(e) =>
                        handleArrayChange(
                          index,
                          e.target.value,
                          possibleCauses,
                          setPossibleCauses
                        )
                      }
                      required
                      className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Cause ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveField(index, possibleCauses, setPossibleCauses)
                      }
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddField(possibleCauses, setPossibleCauses)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Cause
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resolution Steps *
                </label>
                {resolutionSteps.map((step, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={step}
                      onChange={(e) =>
                        handleArrayChange(
                          index,
                          e.target.value,
                          resolutionSteps,
                          setResolutionSteps
                        )
                      }
                      required
                      className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Step ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveField(index, resolutionSteps, setResolutionSteps)
                      }
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddField(resolutionSteps, setResolutionSteps)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Affected Components
                </label>
                {affectedComponents.map((component, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={component}
                      onChange={(e) =>
                        handleArrayChange(
                          index,
                          e.target.value,
                          affectedComponents,
                          setAffectedComponents
                        )
                      }
                      className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Component ID or name"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveField(
                          index,
                          affectedComponents,
                          setAffectedComponents
                        )
                      }
                      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    handleAddField(affectedComponents, setAffectedComponents)
                  }
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Component
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., authentication, frontend, critical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Related Tickets (comma-separated)
                </label>
                <input
                  type="text"
                  value={relatedTickets}
                  onChange={(e) => setRelatedTickets(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., INC-1234, INC-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resolution Confidence (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={resolutionConfidence}
                  onChange={(e) => setResolutionConfidence(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0-100"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-input rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editIssue ? 'Update Issue' : 'Create Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
