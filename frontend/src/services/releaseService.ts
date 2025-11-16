// ABOUTME: Service layer for Release Monitor feature handling release updates and user preferences.
// ABOUTME: Provides data fetching and localStorage management for followed sources and read status.

import releasesData from '@/data/releases.json'
import type { ReleaseUpdate, UserPreferences, UpdateSource } from '@/types/release'

const releases: ReleaseUpdate[] = releasesData as ReleaseUpdate[]

const PREFERENCES_KEY = 'nova_release_preferences'

export const getAllReleases = async (): Promise<ReleaseUpdate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(releases), 100)
  })
}

export const getCriticalReleases = async (): Promise<ReleaseUpdate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const critical = releases
        .filter((r) => r.impact === 'critical' || r.impact === 'high')
        .sort((a, b) => {
          if (a.impact === 'critical' && b.impact !== 'critical') return -1
          if (a.impact !== 'critical' && b.impact === 'critical') return 1
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        })
      resolve(critical)
    }, 100)
  })
}

export const getUserPreferences = (): UserPreferences => {
  const stored = localStorage.getItem(PREFERENCES_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return {
    followedSources: [],
    readUpdates: [],
  }
}

export const saveUserPreferences = (preferences: UserPreferences): void => {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
}

export const toggleFollowSource = (source: UpdateSource): void => {
  const prefs = getUserPreferences()
  const index = prefs.followedSources.indexOf(source)
  if (index > -1) {
    prefs.followedSources.splice(index, 1)
  } else {
    prefs.followedSources.push(source)
  }
  saveUserPreferences(prefs)
}

export const markAsRead = (updateId: string): void => {
  const prefs = getUserPreferences()
  if (!prefs.readUpdates.includes(updateId)) {
    prefs.readUpdates.push(updateId)
    saveUserPreferences(prefs)
  }
}

export const isUpdateRead = (updateId: string): boolean => {
  const prefs = getUserPreferences()
  return prefs.readUpdates.includes(updateId)
}
