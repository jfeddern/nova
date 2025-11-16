// ABOUTME: Service for fetching application tech stack and SBOM data.
// ABOUTME: Provides methods to retrieve dependencies, runtimes, and security insights.

import techstackData from '@/data/techstack.json'
import type { TechStackData } from '@/types/techstack'

type TechStackDataMap = Record<string, TechStackData | null>

const techstacks: TechStackDataMap = techstackData as TechStackDataMap

export const getTechStack = async (appId: string): Promise<TechStackData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = techstacks[appId]
      resolve(data || null)
    }, 400)
  })
}
