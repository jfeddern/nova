import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeamById } from '@/services/teamService'
import { getApplications } from '@/services/applicationService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TeamMember } from '@/types/team'
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Mail,
  MessageSquare,
  Users,
  Building2,
  AlertCircle,
  UserCircle,
  Package,
  Plus,
  X,
} from 'lucide-react'

export function TeamDetails() {
  const { id } = useParams<{ id: string }>()
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState<TeamMember>({ name: '', role: '', email: '' })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (team?.members) {
      setTeamMembers(team.members)
    }
  }, [team])

  const { data: allApplications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.role.trim() && newMember.email.trim()) {
      setTeamMembers([...teamMembers, { ...newMember }])
      setNewMember({ name: '', role: '', email: '' })
      setShowAddMember(false)
    }
  }

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading team details...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Team not found</p>
        <Link to="/teams">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </Link>
      </div>
    )
  }

  const teamApplications = allApplications.filter((app) => app.owner.team === team.name)

  const criticalityColors = {
    P1: 'destructive',
    P2: 'warning',
    P3: 'secondary',
  } as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/teams">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link to={`/teams/${team.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{team.name}</h1>
        </div>
        <p className="text-base text-muted-foreground">{team.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p className="text-base">{team.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Size</p>
              <p className="text-base">{team.member_count} members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Team Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base">{team.lead_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <a
                href={`mailto:${team.lead_email}`}
                className="text-base text-primary hover:underline flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {team.lead_email}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Team Email</p>
            <a
              href={`mailto:${team.contact_email}`}
              className="text-base text-primary hover:underline flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {team.contact_email}
            </a>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">MS Teams Channel</p>
            <a
              href={`teams://channel?team=T1234&id=${team.teams_channel}`}
              className="text-base text-primary hover:underline flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {team.teams_channel}
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {team.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {team.customLinks && team.customLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Links to external resources and tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {team.customLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
              >
                <span className="font-medium">{link.title}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {(teamMembers.length > 0 || team) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'} in this team
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowAddMember(!showAddMember)}
              >
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddMember && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-3">
                <h4 className="text-sm font-semibold">New Team Member</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                  <Input
                    placeholder="Role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddMember}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddMember(false)
                      setNewMember({ name: '', role: '', email: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {teamMembers.length > 0 ? (
                teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-8 w-8 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No team members added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Applications
          </CardTitle>
          <CardDescription>
            Applications owned and managed by {team.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamApplications.length > 0 ? (
            <div className="space-y-2">
              {teamApplications.map((app) => (
                <Link key={app.id} to={`/applications/${app.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{app.name}</span>
                      <span className="text-xs text-muted-foreground">{app.brief}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {app.environment}
                      </Badge>
                      <Badge variant={criticalityColors[app.criticality]} className="text-xs">
                        {app.criticality}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No applications owned by this team</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
