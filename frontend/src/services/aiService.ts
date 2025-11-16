import { getApplications } from './applicationService'
import { getVulnerabilityStats, getAllVulnerabilities } from './vulnerabilityService'
import { getTeams } from './teamService'
import { getPlatformTools } from './platformToolService'
import type { Application } from '@/types/application'
import type { VulnerabilityStats, Vulnerability } from '@/types/vulnerability'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DataContext {
  applicationCount: number
  vulnerabilityStats: VulnerabilityStats
  teamCount: number
  platformToolCount: number
  criticalVulns: Vulnerability[]
  applications: Application[]
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchDataContext = async (): Promise<DataContext> => {
  const [applications, vulnerabilityStats, teams, platformTools, vulnerabilities] =
    await Promise.all([
      getApplications(),
      getVulnerabilityStats(),
      getTeams(),
      getPlatformTools(),
      getAllVulnerabilities(),
    ])

  const criticalVulns = vulnerabilities.filter((v) => v.severity === 'critical')

  return {
    applicationCount: applications.length,
    vulnerabilityStats,
    teamCount: teams.length,
    platformToolCount: platformTools.length,
    criticalVulns,
    applications,
  }
}

const generateMockResponse = async (userMessage: string): Promise<string> => {
  const lowerMessage = userMessage.toLowerCase()
  const context = await fetchDataContext()

  // Security-related queries
  if (lowerMessage.includes('vulnerabilit') || lowerMessage.includes('security') || lowerMessage.includes('risk')) {
    if (lowerMessage.includes('critical') || lowerMessage.includes('severe')) {
      return `Based on the current data, there are **${context.vulnerabilityStats.critical}** critical vulnerabilities across your applications. The total number of vulnerabilities is **${context.vulnerabilityStats.total}**, with ${context.vulnerabilityStats.high} high severity, ${context.vulnerabilityStats.medium} medium severity, and ${context.vulnerabilityStats.low} low severity issues.`
    }
    if (lowerMessage.includes('how many') || lowerMessage.includes('total')) {
      return `Currently, your applications have a total of **${context.vulnerabilityStats.total}** vulnerabilities:\n- Critical: **${context.vulnerabilityStats.critical}**\n- High: **${context.vulnerabilityStats.high}**\n- Medium: **${context.vulnerabilityStats.medium}**\n- Low: **${context.vulnerabilityStats.low}**`
    }
    return `Your security posture shows ${context.vulnerabilityStats.total} total vulnerabilities, with ${context.vulnerabilityStats.critical} critical issues requiring immediate attention.`
  }

  // Application-related queries
  if (lowerMessage.includes('application') || lowerMessage.includes('app')) {
    if (lowerMessage.includes('how many') || lowerMessage.includes('total') || lowerMessage.includes('count')) {
      return `You currently have **${context.applicationCount}** applications registered in the system.`
    }
    if (lowerMessage.includes('list') || lowerMessage.includes('show')) {
      const appList = context.applications.slice(0, 5).map((app) => `- ${app.name}`).join('\n')
      return `Here are some of your applications:\n${appList}\n\n${context.applicationCount > 5 ? `...and ${context.applicationCount - 5} more.` : ''}`
    }
    return `You have ${context.applicationCount} applications being tracked. You can view them on the Applications page.`
  }

  // Team-related queries
  if (lowerMessage.includes('team')) {
    return `There are currently **${context.teamCount}** teams in your organization managing the various applications and services.`
  }

  // Platform-related queries
  if (lowerMessage.includes('platform') || lowerMessage.includes('tool')) {
    return `Your platform inventory contains **${context.platformToolCount}** tools and services that support your infrastructure.`
  }

  // Summary/overview queries
  if (lowerMessage.includes('overview') || lowerMessage.includes('summary') || lowerMessage.includes('status')) {
    return `**System Overview:**\n- Applications: ${context.applicationCount}\n- Teams: ${context.teamCount}\n- Platform Tools: ${context.platformToolCount}\n- Total Vulnerabilities: ${context.vulnerabilityStats.total}\n- Critical Vulnerabilities: ${context.vulnerabilityStats.critical}\n\nYour system is actively monitoring security and platform health.`
  }

  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.match(/^hi$/)) {
    return `Hello! I'm your Nova AI assistant. I can help you with information about your applications, security vulnerabilities, teams, and platform tools. What would you like to know?`
  }

  // Help
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
    return `I can help you with:\n- **Security**: Ask about vulnerabilities, risk levels, and security status\n- **Applications**: Get counts, lists, and details about your apps\n- **Teams**: Information about teams and their structure\n- **Platform**: Details about your platform tools and services\n\nTry asking something like "How many critical vulnerabilities do we have?" or "Show me our applications."`
  }

  // Default fallback
  return `I understand you're asking about "${userMessage}". While I'm a mock assistant right now, I can answer questions about your applications, vulnerabilities, teams, and platform tools. Try asking about security status, application counts, or request an overview!`
}

export const sendChatMessage = async (message: string): Promise<ChatMessage> => {
  await delay(500 + Math.random() * 1000)

  const response = await generateMockResponse(message)

  return {
    id: generateId(),
    role: 'assistant',
    content: response,
    timestamp: new Date(),
  }
}
