import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getApplications } from '@/services/applicationService'
import { ApplicationTable } from '@/components/applications/ApplicationTable'
import { ApplicationGrid } from '@/components/applications/ApplicationGrid'
import { SearchBar } from '@/components/applications/SearchBar'
import { FilterPanel } from '@/components/applications/FilterPanel'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Table, Plus } from 'lucide-react'
import { Application } from '@/types/application'

export function Dashboard() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedCriticality, setSelectedCriticality] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  })

  const filteredApplications = applications.filter((app: Application) => {
    const matchesSearch =
      searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.owner.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.department.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment =
      selectedDepartments.length === 0 || selectedDepartments.includes(app.department)

    const matchesCriticality =
      selectedCriticality.length === 0 || selectedCriticality.includes(app.criticality)

    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => app.tags.includes(tag))

    return matchesSearch && matchesDepartment && matchesCriticality && matchesTags
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-black bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Service Catalog 
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage and explore all applications and services
          </p>
        </div>
        <Button size="lg" onClick={() => navigate('/applications/new')}>
          <Plus className="h-5 w-5" />
          New Application
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64">
          <FilterPanel
            applications={applications}
            selectedDepartments={selectedDepartments}
            selectedCriticality={selectedCriticality}
            selectedTags={selectedTags}
            onDepartmentsChange={setSelectedDepartments}
            onCriticalityChange={setSelectedCriticality}
            onTagsChange={setSelectedTags}
          />
        </div>
        <div className="flex-1">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No applications found matching your criteria.</p>
            </div>
          ) : viewMode === 'table' ? (
            <ApplicationTable applications={filteredApplications} />
          ) : (
            <ApplicationGrid applications={filteredApplications} />
          )}
        </div>
      </div>
    </div>
  )
}
