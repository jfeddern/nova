// ABOUTME: Filter bar component for Release Monitor with source, category, impact, and tag filters.
// ABOUTME: Provides dropdown filters and search functionality for filtering release updates.

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import type { UpdateSource, UpdateCategory, ImpactLevel } from '@/types/release'

interface FilterBarProps {
  searchQuery: string
  selectedSources: UpdateSource[]
  selectedCategories: UpdateCategory[]
  selectedImpacts: ImpactLevel[]
  selectedTags: string[]
  availableSources: UpdateSource[]
  availableCategories: UpdateCategory[]
  availableTags: string[]
  onSearchChange: (query: string) => void
  onSourceToggle: (source: UpdateSource) => void
  onCategoryToggle: (category: UpdateCategory) => void
  onImpactToggle: (impact: ImpactLevel) => void
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
}

export function FilterBar({
  searchQuery,
  selectedSources,
  selectedCategories,
  selectedImpacts,
  selectedTags,
  availableSources,
  availableCategories,
  availableTags,
  onSearchChange,
  onSourceToggle,
  onCategoryToggle,
  onImpactToggle,
  onTagToggle,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    selectedSources.length > 0 ||
    selectedCategories.length > 0 ||
    selectedImpacts.length > 0 ||
    selectedTags.length > 0

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <FilterDropdown
            label="Source"
            items={availableSources}
            selectedItems={selectedSources}
            onToggle={onSourceToggle}
          />

          <FilterDropdown
            label="Category"
            items={availableCategories}
            selectedItems={selectedCategories}
            onToggle={onCategoryToggle}
          />

          <FilterDropdown
            label="Impact"
            items={['critical', 'high', 'medium', 'low'] as ImpactLevel[]}
            selectedItems={selectedImpacts}
            onToggle={onImpactToggle}
          />

          <FilterDropdown
            label="Tags"
            items={availableTags}
            selectedItems={selectedTags}
            onToggle={onTagToggle}
          />

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-accent"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedSources.map((source) => (
            <Badge key={source} variant="secondary" className="gap-1">
              {source}
              <button onClick={() => onSourceToggle(source)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <button onClick={() => onCategoryToggle(category)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedImpacts.map((impact) => (
            <Badge key={impact} variant="secondary" className="gap-1">
              Impact: {impact}
              <button onClick={() => onImpactToggle(impact)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button onClick={() => onTagToggle(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

interface FilterDropdownProps<T extends string> {
  label: string
  items: T[]
  selectedItems: T[]
  onToggle: (item: T) => void
}

function FilterDropdown<T extends string>({
  label,
  items,
  selectedItems,
  onToggle,
}: FilterDropdownProps<T>) {
  return (
    <details className="relative">
      <summary className="cursor-pointer px-3 py-2 text-sm border rounded-md hover:bg-accent list-none flex items-center gap-1">
        {label} {selectedItems.length > 0 && `(${selectedItems.length})`}
        <span className="ml-1">▾</span>
      </summary>
      <div className="absolute top-full mt-1 bg-background border rounded-md shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
        {items.map((item) => (
          <label
            key={item}
            className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => onToggle(item)}
              className="rounded"
            />
            <span className="text-sm">{item}</span>
          </label>
        ))}
      </div>
    </details>
  )
}
