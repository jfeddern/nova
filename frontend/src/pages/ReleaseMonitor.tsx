// ABOUTME: Release Monitor main page providing centralized view of platform updates and announcements.
// ABOUTME: Features tabbed interface (All News, For You, Critical, Following) with filtering and personalization.

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { getAllReleases, getCriticalReleases, getUserPreferences, toggleFollowSource, markAsRead } from '@/services/releaseService'
import { getTechLandscape } from '@/services/techLandscapeService'
import { UpdateCard } from '@/components/releases/UpdateCard'
import { FilterBar } from '@/components/releases/FilterBar'
import { CriticalUpdatesPanel } from '@/components/releases/CriticalUpdatesPanel'
import type { ReleaseUpdate, UpdateSource, UpdateCategory, ImpactLevel } from '@/types/release'

type TabType = 'all' | 'for-you' | 'critical' | 'following'

export function ReleaseMonitor() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSources, setSelectedSources] = useState<UpdateSource[]>([])
  const [selectedCategories, setSelectedCategories] = useState<UpdateCategory[]>([])
  const [selectedImpacts, setSelectedImpacts] = useState<ImpactLevel[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [userPreferences, setUserPreferences] = useState(getUserPreferences())
  const [forceUpdate, setForceUpdate] = useState(0)

  const { data: allUpdates = [] } = useQuery({
    queryKey: ['releases'],
    queryFn: getAllReleases,
  })

  const { data: criticalUpdates = [] } = useQuery({
    queryKey: ['critical-releases'],
    queryFn: getCriticalReleases,
  })

  const { data: techLandscape } = useQuery({
    queryKey: ['tech-landscape'],
    queryFn: getTechLandscape,
  })

  // Extract unique values for filters
  const availableSources = useMemo(
    () => Array.from(new Set(allUpdates.map((u) => u.source))).sort(),
    [allUpdates]
  )

  const availableCategories = useMemo(
    () => Array.from(new Set(allUpdates.map((u) => u.category))).sort(),
    [allUpdates]
  )

  const availableTags = useMemo(
    () => Array.from(new Set(allUpdates.flatMap((u) => u.tags))).sort(),
    [allUpdates]
  )

  // Build personalization based on user's applications
  const personalizedUpdates = useMemo(() => {
    if (!techLandscape) return []

    // Extract technologies used across all applications
    const usedTechnologies = new Set<string>()
    const usedLanguages = new Set<string>()
    const usedFrameworks = new Set<string>()

    techLandscape.runtimeDistribution.forEach((runtime) => {
      usedLanguages.add(runtime.language.toLowerCase())
      usedTechnologies.add(runtime.runtime.toLowerCase())
    })

    techLandscape.frameworkDistribution.forEach((framework) => {
      usedFrameworks.add(framework.name.toLowerCase())
      usedTechnologies.add(framework.name.toLowerCase())
    })

    // Score and filter updates based on relevance
    const scoredUpdates = allUpdates.map((update) => {
      let score = 0
      const reasons: string[] = []

      const updateText = `${update.source} ${update.title} ${update.summary} ${update.tags.join(' ')}`.toLowerCase()

      // Check for language/runtime matches
      usedLanguages.forEach((lang) => {
        if (updateText.includes(lang)) {
          score += 10
          reasons.push(`Your applications use ${lang}`)
        }
      })

      // Check for framework matches
      usedFrameworks.forEach((framework) => {
        if (updateText.includes(framework)) {
          score += 8
          const appCount = techLandscape.frameworkDistribution
            .filter((f) => f.name.toLowerCase() === framework)
            .reduce((sum, f) => sum + f.apps.length, 0)
          reasons.push(`${appCount} application${appCount > 1 ? 's' : ''} use ${framework}`)
        }
      })

      // Boost for EOL and Breaking Changes
      if (update.category === 'EOL' || update.category === 'Breaking Change') {
        score += 5
      }

      // Boost for security
      if (update.category === 'Security') {
        score += 7
      }

      // Boost for high/critical impact
      if (update.impact === 'critical') score += 10
      if (update.impact === 'high') score += 5

      return {
        update,
        score,
        reasons: Array.from(new Set(reasons)),
      }
    })

    return scoredUpdates
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => ({ ...item.update, relevantTo: item.reasons }))
  }, [allUpdates, techLandscape])

  // Filter updates based on active tab and filters
  const filteredUpdates = useMemo(() => {
    let updates: ReleaseUpdate[] = []

    switch (activeTab) {
      case 'all':
        updates = allUpdates
        break
      case 'for-you':
        updates = personalizedUpdates
        break
      case 'critical':
        updates = criticalUpdates
        break
      case 'following':
        updates = allUpdates.filter((u) => userPreferences.followedSources.includes(u.source))
        break
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      updates = updates.filter(
        (u) =>
          u.title.toLowerCase().includes(query) ||
          u.summary.toLowerCase().includes(query) ||
          u.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          u.source.toLowerCase().includes(query)
      )
    }

    // Apply source filter
    if (selectedSources.length > 0) {
      updates = updates.filter((u) => selectedSources.includes(u.source))
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      updates = updates.filter((u) => selectedCategories.includes(u.category))
    }

    // Apply impact filter
    if (selectedImpacts.length > 0) {
      updates = updates.filter((u) => selectedImpacts.includes(u.impact))
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      updates = updates.filter((u) => selectedTags.some((tag) => u.tags.includes(tag)))
    }

    return updates
  }, [activeTab, allUpdates, personalizedUpdates, criticalUpdates, userPreferences, searchQuery, selectedSources, selectedCategories, selectedImpacts, selectedTags])

  const handleToggleFollow = (source: UpdateSource) => {
    toggleFollowSource(source)
    setUserPreferences(getUserPreferences())
    setForceUpdate((prev) => prev + 1)
  }

  const handleMarkAsRead = (updateId: string) => {
    markAsRead(updateId)
    setUserPreferences(getUserPreferences())
    setForceUpdate((prev) => prev + 1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedSources([])
    setSelectedCategories([])
    setSelectedImpacts([])
    setSelectedTags([])
  }

  const toggleFilter = <T,>(items: T[], item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (items.includes(item)) {
      setter(items.filter((i) => i !== item))
    } else {
      setter([...items, item])
    }
  }

  const tabs = [
    { id: 'all' as TabType, label: 'All News', count: allUpdates.length },
    { id: 'for-you' as TabType, label: 'For You', count: personalizedUpdates.length },
    { id: 'critical' as TabType, label: 'Critical', count: criticalUpdates.length },
    { id: 'following' as TabType, label: 'Following', count: userPreferences.followedSources.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Release Monitor
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay informed about platform updates, security advisories, and technology releases
          </p>
        </div>
      </div>

      {/* Show critical updates panel on non-critical tabs */}
      {activeTab !== 'critical' && criticalUpdates.length > 0 && (
        <CriticalUpdatesPanel updates={criticalUpdates} />
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchQuery={searchQuery}
        selectedSources={selectedSources}
        selectedCategories={selectedCategories}
        selectedImpacts={selectedImpacts}
        selectedTags={selectedTags}
        availableSources={availableSources}
        availableCategories={availableCategories}
        availableTags={availableTags}
        onSearchChange={setSearchQuery}
        onSourceToggle={(source) => toggleFilter(selectedSources, source, setSelectedSources)}
        onCategoryToggle={(category) => toggleFilter(selectedCategories, category, setSelectedCategories)}
        onImpactToggle={(impact) => toggleFilter(selectedImpacts, impact, setSelectedImpacts)}
        onTagToggle={(tag) => toggleFilter(selectedTags, tag, setSelectedTags)}
        onClearFilters={handleClearFilters}
      />

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {activeTab === 'following' && userPreferences.followedSources.length === 0
                ? 'You are not following any sources yet. Click the "Follow" button on any update to start.'
                : 'No updates match your current filters.'}
            </p>
          </div>
        ) : (
          filteredUpdates.map((update) => (
            <UpdateCard
              key={`${update.id}-${forceUpdate}`}
              update={update}
              isRead={userPreferences.readUpdates.includes(update.id)}
              isFollowing={userPreferences.followedSources.includes(update.source)}
              onMarkAsRead={() => handleMarkAsRead(update.id)}
              onToggleFollow={() => handleToggleFollow(update.source)}
              relevanceReason={activeTab === 'for-you' ? (update as unknown as { relevantTo?: string[] }).relevantTo : undefined}
            />
          ))
        )}
      </div>

      {filteredUpdates.length > 0 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Showing {filteredUpdates.length} update{filteredUpdates.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
