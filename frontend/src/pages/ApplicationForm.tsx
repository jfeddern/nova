import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApplications, getApplicationById } from '@/services/applicationService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Datastore, DatastoreType } from '@/types/datastore'
import { CustomLink } from '@/types/application'
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Building2,
  Users,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Tag,
  AlertCircle,
  CheckCircle2,
  Database,
} from 'lucide-react'

export function ApplicationForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const { data: existingApp } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id!),
    enabled: isEditing,
  })

  const [formData, setFormData] = useState({
    name: existingApp?.name || '',
    brief: existingApp?.brief || '',
    description: existingApp?.description || '',
    department: existingApp?.department || '',
    team: existingApp?.owner.team || '',
    contactEmail: existingApp?.owner.contact_email || '',
    teamsChannel: existingApp?.owner.teams_channel || '',
    environment: existingApp?.environment || 'production',
    repository: existingApp?.links.repository || '',
    documentation: existingApp?.links.documentation || '',
    monitoring: existingApp?.links.monitoring || '',
  })

  const [selectedTags, setSelectedTags] = useState<string[]>(existingApp?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    existingApp?.dependencies || []
  )
  const [datastores, setDatastores] = useState<Datastore[]>(existingApp?.datastores || [])
  const [newDatastore, setNewDatastore] = useState({ name: '', type: 'postgresql' as DatastoreType })
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(existingApp?.customLinks || [])
  const [newCustomLink, setNewCustomLink] = useState({ title: '', url: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  const availableTags = Array.from(
    new Set(applications.flatMap((app) => app.tags))
  ).sort()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuccess(true)
    setTimeout(() => {
      navigate('/')
    }, 2000)
  }

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const toggleDependency = (appId: string) => {
    if (selectedDependencies.includes(appId)) {
      setSelectedDependencies(selectedDependencies.filter((id) => id !== appId))
    } else {
      setSelectedDependencies([...selectedDependencies, appId])
    }
  }

  const addDatastore = () => {
    if (newDatastore.name.trim()) {
      const datastore: Datastore = {
        id: `ds-${Date.now()}`,
        name: newDatastore.name.trim(),
        type: newDatastore.type,
      }
      setDatastores([...datastores, datastore])
      setNewDatastore({ name: '', type: 'postgresql' })
    }
  }

  const removeDatastore = (id: string) => {
    setDatastores(datastores.filter((ds) => ds.id !== id))
  }

  const addCustomLink = () => {
    if (newCustomLink.title.trim() && newCustomLink.url.trim()) {
      setCustomLinks([...customLinks, { title: newCustomLink.title.trim(), url: newCustomLink.url.trim() }])
      setNewCustomLink({ title: '', url: '' })
    }
  }

  const removeCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          {isEditing ? 'Edit Application' : 'Create New Application'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isEditing
            ? 'Update application details and dependencies'
            : 'Add a new application to the catalog'}
        </p>
      </div>

      {showSuccess && (
        <div className="bg-success/10 border-2 border-success rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="font-semibold text-success">
            Application {isEditing ? 'updated' : 'created'} successfully! Redirecting...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Core details about the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Application Name *
                </label>
                <Input
                  required
                  placeholder="e.g., Customer Portal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Department *</label>
                <Input
                  required
                  placeholder="e.g., Digital Experience"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Brief Description *</label>
              <Input
                required
                placeholder="One-line summary of what this application does..."
                value={formData.brief}
                onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                A short, one-sentence description to help users quickly understand the application
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Detailed Description *</label>
              <textarea
                required
                className="flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:shadow-md disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/50"
                placeholder="Describe the purpose and functionality of this application..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Environment *</label>
                <select
                  required
                  className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/50"
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Ownership & Contact
            </CardTitle>
            <CardDescription>Team responsible for this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Team Name *</label>
              <Input
                required
                placeholder="e.g., Customer Web Team"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Email *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="team@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  MS Teams Channel *
                </label>
                <Input
                  required
                  placeholder="#team-channel"
                  value={formData.teamsChannel}
                  onChange={(e) => setFormData({ ...formData, teamsChannel: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Resources & Links
            </CardTitle>
            <CardDescription>External resources for this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Repository URL</label>
              <Input
                type="url"
                placeholder="https://github.com/company/repo"
                value={formData.repository}
                onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Documentation URL</label>
              <Input
                type="url"
                placeholder="https://docs.company.com/app"
                value={formData.documentation}
                onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Monitoring Dashboard</label>
              <Input
                type="url"
                placeholder="https://grafana.company.com/dashboard"
                value={formData.monitoring}
                onChange={(e) => setFormData({ ...formData, monitoring: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold text-foreground mb-3">Custom Links</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Add any additional resources or links relevant to this application
              </p>

              <div className="space-y-3 mb-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Link Title (e.g., API Documentation)"
                    value={newCustomLink.title}
                    onChange={(e) => setNewCustomLink({ ...newCustomLink, title: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={newCustomLink.url}
                      onChange={(e) => setNewCustomLink({ ...newCustomLink, url: e.target.value })}
                    />
                    <Button type="button" onClick={addCustomLink}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {customLinks.length > 0 && (
                <div className="space-y-2">
                  {customLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Tags
            </CardTitle>
            <CardDescription>Categorize with relevant tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-2">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter((tag) => !selectedTags.includes(tag))
                  .slice(0, 10)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSelectedTags([...selectedTags, tag])}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Datastores
            </CardTitle>
            <CardDescription>Data storage systems used by this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Datastore Name</label>
                <Input
                  placeholder="e.g., customer-db, user-cache"
                  value={newDatastore.name}
                  onChange={(e) => setNewDatastore({ ...newDatastore, name: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDatastore())}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Type</label>
                <select
                  className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2.5 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/50"
                  value={newDatastore.type}
                  onChange={(e) =>
                    setNewDatastore({ ...newDatastore, type: e.target.value as DatastoreType })
                  }
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="mysql">MySQL</option>
                  <option value="redis">Redis</option>
                  <option value="s3">S3</option>
                  <option value="elasticsearch">Elasticsearch</option>
                  <option value="dynamodb">DynamoDB</option>
                  <option value="kafka">Kafka</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addDatastore} className="w-full md:w-auto">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {datastores.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold">Configured datastores ({datastores.length}):</p>
                <div className="space-y-2">
                  {datastores.map((ds) => (
                    <div
                      key={ds.id}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-border/50 bg-accent/30"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-semibold">{ds.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{ds.type}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDatastore(ds.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Dependencies
            </CardTitle>
            <CardDescription>
              Select applications that this application depends on
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2 border-2 border-border/50 rounded-xl p-4">
              {applications
                .filter((app) => !isEditing || app.id !== id)
                .map((app) => {
                  const isSelected = selectedDependencies.includes(app.id)
                  return (
                    <label
                      key={app.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDependency(app.id)}
                        className="rounded"
                      />
                      <span className="font-medium">{app.name}</span>
                    </label>
                  )
                })}
            </div>
            {selectedDependencies.length > 0 && (
              <div className="p-4 bg-accent/50 rounded-xl">
                <p className="text-sm font-semibold mb-2">
                  Selected dependencies ({selectedDependencies.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedDependencies.map((depId) => {
                    const dep = applications.find((app) => app.id === depId)
                    return dep ? (
                      <Badge key={depId} variant="default" className="gap-2">
                        {dep.name}
                        <button type="button" onClick={() => toggleDependency(depId)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border-2 border-border/50 shadow-xl">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            <Save className="h-4 w-4" />
            {isEditing ? 'Update Application' : 'Create Application'}
          </Button>
        </div>
      </form>
    </div>
  )
}
