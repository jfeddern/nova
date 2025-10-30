import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeamById, getTeams } from '@/services/teamService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TeamCustomLink } from '@/types/team'
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
  CheckCircle2,
  UserCircle,
} from 'lucide-react'

export function TeamForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const { data: existingTeam } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: isEditing,
  })

  const [formData, setFormData] = useState({
    name: existingTeam?.name || '',
    description: existingTeam?.description || '',
    department: existingTeam?.department || '',
    contact_email: existingTeam?.contact_email || '',
    teams_channel: existingTeam?.teams_channel || '',
    lead_name: existingTeam?.lead_name || '',
    lead_email: existingTeam?.lead_email || '',
    member_count: existingTeam?.member_count || 1,
  })

  const [selectedTags, setSelectedTags] = useState<string[]>(existingTeam?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [customLinks, setCustomLinks] = useState<TeamCustomLink[]>(existingTeam?.customLinks || [])
  const [newCustomLink, setNewCustomLink] = useState({ title: '', url: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  const availableTags = Array.from(
    new Set(teams.flatMap((team) => team.tags))
  ).sort()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuccess(true)
    setTimeout(() => {
      navigate('/teams')
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

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      removeTag(tag)
    } else {
      setSelectedTags([...selectedTags, tag])
    }
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

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-success" />
        <h2 className="text-2xl font-bold">
          Team {isEditing ? 'Updated' : 'Created'} Successfully!
        </h2>
        <p className="text-muted-foreground">Redirecting to teams page...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teams">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Team' : 'Create New Team'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Update team information and settings' : 'Add a new team to the organization'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Core team details and identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Team Name *</label>
              <Input
                required
                placeholder="e.g., Platform Engineering Team"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Description *</label>
              <Textarea
                required
                placeholder="Describe the team's responsibilities and focus areas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Department *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    placeholder="e.g., Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Member Count *</label>
                <Input
                  required
                  type="number"
                  min="1"
                  placeholder="Number of team members"
                  value={formData.member_count}
                  onChange={(e) => setFormData({ ...formData, member_count: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Team Lead
            </CardTitle>
            <CardDescription>Information about the team lead</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Lead Name *</label>
                <Input
                  required
                  placeholder="e.g., John Doe"
                  value={formData.lead_name}
                  onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Lead Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="email"
                    placeholder="john.doe@company.com"
                    value={formData.lead_email}
                    onChange={(e) => setFormData({ ...formData, lead_email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Team contact channels and communication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Team Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  placeholder="team@company.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">MS Teams Channel *</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  placeholder="team-platform-engineering"
                  value={formData.teams_channel}
                  onChange={(e) => setFormData({ ...formData, teams_channel: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </CardTitle>
            <CardDescription>Categorize the team with relevant tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {availableTags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Common tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTags.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Resources & Links
            </CardTitle>
            <CardDescription>Additional resources and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold text-foreground mb-3">Custom Links</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Add any additional resources or links relevant to this team
              </p>

              <div className="space-y-3 mb-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Link Title (e.g., Team Wiki)"
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

        <div className="flex gap-4 justify-end">
          <Link to="/teams">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {isEditing ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </div>
  )
}
