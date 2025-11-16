// ABOUTME: Tech landscape service aggregating SBOM data across all applications.
// ABOUTME: Provides portfolio-wide insights for security teams, architects, and managers.

import { getTechStack } from './techstackService'
import { getApplications } from './applicationService'
import type { HealthStatus, RuntimeStatus } from '@/types/techstack'

export interface RuntimeDistributionItem {
  language: string
  runtime: string
  version: string
  status: RuntimeStatus
  appCount: number
  apps: Array<{ id: string; name: string }>
}

export interface FrameworkDistributionItem {
  name: string
  version: string
  appCount: number
  apps: Array<{ id: string; name: string }>
}

export interface CriticalDependency {
  name: string
  version: string
  severity: 'critical' | 'warning'
  affectedApps: Array<{ id: string; name: string }>
  issue: string
}

export interface AppHealthSummary {
  id: string
  name: string
  status: HealthStatus | 'no-sbom'
  criticalCount: number
  warningCount: number
  totalDependencies: number
  hasEolRuntime: boolean
}

export interface TechLandscapeData {
  summary: {
    totalApps: number
    appsWithSbom: number
    appsWithCritical: number
    appsWithWarnings: number
    appsWithEol: number
    totalCriticalIssues: number
    totalWarnings: number
  }
  runtimeDistribution: RuntimeDistributionItem[]
  frameworkDistribution: FrameworkDistributionItem[]
  criticalDependencies: CriticalDependency[]
  appsNeedingAttention: AppHealthSummary[]
}

export const getTechLandscape = async (): Promise<TechLandscapeData> => {
  const applications = await getApplications()

  // Fetch tech stack data for all applications
  const techStackPromises = applications.map(async (app) => {
    try {
      const techStack = await getTechStack(app.id)
      return { app, techStack }
    } catch {
      return { app, techStack: null }
    }
  })

  const appTechStacks = await Promise.all(techStackPromises)

  // Filter apps with SBOM data
  const appsWithSbom = appTechStacks.filter((item) => item.techStack !== null)

  // Aggregate runtime distribution
  const runtimeMap = new Map<string, RuntimeDistributionItem>()
  appsWithSbom.forEach(({ app, techStack }) => {
    if (!techStack) return

    techStack.runtimes.forEach((runtime) => {
      const key = `${runtime.language}-${runtime.runtime}-${runtime.version}`

      if (!runtimeMap.has(key)) {
        runtimeMap.set(key, {
          language: runtime.language,
          runtime: runtime.runtime,
          version: runtime.version,
          status: runtime.status,
          appCount: 0,
          apps: [],
        })
      }

      const item = runtimeMap.get(key)!
      item.appCount++
      item.apps.push({ id: app.id, name: app.name })
    })
  })

  // Aggregate framework distribution
  const frameworkMap = new Map<string, FrameworkDistributionItem>()
  appsWithSbom.forEach(({ app, techStack }) => {
    if (!techStack) return

    techStack.frameworks.forEach((framework) => {
      const key = `${framework.name}-${framework.version}`

      if (!frameworkMap.has(key)) {
        frameworkMap.set(key, {
          name: framework.name,
          version: framework.version,
          appCount: 0,
          apps: [],
        })
      }

      const item = frameworkMap.get(key)!
      item.appCount++
      item.apps.push({ id: app.id, name: app.name })
    })
  })

  // Aggregate critical dependencies
  const criticalDepMap = new Map<string, CriticalDependency>()
  appsWithSbom.forEach(({ app, techStack }) => {
    if (!techStack) return

    techStack.topIssues.forEach((issue) => {
      const key = `${issue.component}-${issue.version}-${issue.reason}`

      if (!criticalDepMap.has(key)) {
        criticalDepMap.set(key, {
          name: issue.component,
          version: issue.version,
          severity: issue.status === 'critical' ? 'critical' : 'warning',
          affectedApps: [],
          issue: issue.reason,
        })
      }

      const item = criticalDepMap.get(key)!
      item.affectedApps.push({ id: app.id, name: app.name })
    })
  })

  // Build app health summaries
  const appsNeedingAttention: AppHealthSummary[] = appTechStacks.map(({ app, techStack }) => {
    if (!techStack) {
      return {
        id: app.id,
        name: app.name,
        status: 'no-sbom' as const,
        criticalCount: 0,
        warningCount: 0,
        totalDependencies: 0,
        hasEolRuntime: false,
      }
    }

    const hasEolRuntime = techStack.runtimes.some((r) => r.status === 'eol' || r.status === 'eol_soon')
    const criticalCount = techStack.components.records.filter((c) => c.status === 'critical').length
    const warningCount = techStack.components.records.filter((c) => c.status === 'warning').length

    return {
      id: app.id,
      name: app.name,
      status: techStack.summary.health,
      criticalCount,
      warningCount,
      totalDependencies: techStack.components.total,
      hasEolRuntime,
    }
  })

  // Calculate summary statistics
  const appsWithCritical = appsNeedingAttention.filter((a) => a.criticalCount > 0).length
  const appsWithWarnings = appsNeedingAttention.filter((a) => a.warningCount > 0).length
  const appsWithEol = appsNeedingAttention.filter((a) => a.hasEolRuntime).length
  const totalCriticalIssues = appsNeedingAttention.reduce((sum, a) => sum + a.criticalCount, 0)
  const totalWarnings = appsNeedingAttention.reduce((sum, a) => sum + a.warningCount, 0)

  return {
    summary: {
      totalApps: applications.length,
      appsWithSbom: appsWithSbom.length,
      appsWithCritical,
      appsWithWarnings,
      appsWithEol,
      totalCriticalIssues,
      totalWarnings,
    },
    runtimeDistribution: Array.from(runtimeMap.values()).sort((a, b) => b.appCount - a.appCount),
    frameworkDistribution: Array.from(frameworkMap.values()).sort((a, b) => b.appCount - a.appCount),
    criticalDependencies: Array.from(criticalDepMap.values()).sort(
      (a, b) => b.affectedApps.length - a.affectedApps.length
    ),
    appsNeedingAttention: appsNeedingAttention.filter((a) => a.status !== 'ok'),
  }
}
