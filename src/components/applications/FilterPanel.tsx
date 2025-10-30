import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Application } from '@/types/application'

interface FilterPanelProps {
  applications: Application[]
  selectedDepartments: string[]
  selectedCriticality: string[]
  selectedTags: string[]
  onDepartmentsChange: (departments: string[]) => void
  onCriticalityChange: (criticality: string[]) => void
  onTagsChange: (tags: string[]) => void
}

export function FilterPanel({
  applications,
  selectedDepartments,
  selectedCriticality,
  selectedTags,
  onDepartmentsChange,
  onCriticalityChange,
  onTagsChange,
}: FilterPanelProps) {
  const departments = Array.from(new Set(applications.map((app) => app.department))).sort()
  const criticalities = ['P1', 'P2', 'P3']
  const allTags = Array.from(new Set(applications.flatMap((app) => app.tags))).sort()

  const toggleFilter = (value: string, selected: string[], onChange: (values: string[]) => void) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Department</h3>
          <div className="space-y-2">
            {departments.map((dept) => (
              <label key={dept} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(dept)}
                  onChange={() => toggleFilter(dept, selectedDepartments, onDepartmentsChange)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{dept}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Criticality</h3>
          <div className="space-y-2">
            {criticalities.map((crit) => (
              <label key={crit} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCriticality.includes(crit)}
                  onChange={() => toggleFilter(crit, selectedCriticality, onCriticalityChange)}
                  className="rounded border-gray-300"
                />
                <Badge
                  variant={
                    crit === 'P1' ? 'destructive' : crit === 'P2' ? 'warning' : 'secondary'
                  }
                  className="text-xs"
                >
                  {crit}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleFilter(tag, selectedTags, onTagsChange)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {(selectedDepartments.length > 0 ||
          selectedCriticality.length > 0 ||
          selectedTags.length > 0) && (
          <button
            onClick={() => {
              onDepartmentsChange([])
              onCriticalityChange([])
              onTagsChange([])
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        )}
      </CardContent>
    </Card>
  )
}
