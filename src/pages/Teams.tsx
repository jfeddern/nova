import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { getTeams } from '@/services/teamService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Mail, MessageSquare, Plus, Search, Building2, UserCircle } from 'lucide-react'

export function Teams() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { data: allTeams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const teams = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTeams
    }

    const lowerQuery = searchQuery.toLowerCase()
    return allTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(lowerQuery) ||
        team.description.toLowerCase().includes(lowerQuery) ||
        team.department.toLowerCase().includes(lowerQuery) ||
        team.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  }, [allTeams, searchQuery])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading teams...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage teams across the organization
          </p>
        </div>
        <Link to="/teams/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams by name, department, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {teams.length} {teams.length === 1 ? 'team' : 'teams'} found
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow h-full cursor-pointer" onClick={() => navigate(`/teams/${team.id}`)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {team.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">{team.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{team.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {team.lead_name} ({team.member_count} members)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${team.contact_email}`}
                  className="text-primary hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {team.contact_email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{team.teams_channel}</span>
              </div>
              {team.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {team.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Users className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No teams found matching your search</p>
        </div>
      )}
    </div>
  )
}
