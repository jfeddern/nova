import teamsData from '@/data/teams.json'
import { Team } from '@/types/team'

const teams: Team[] = teamsData as Team[]

export const getTeams = async (): Promise<Team[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(teams), 100)
  })
}

export const getTeamById = async (id: string): Promise<Team | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const team = teams.find((t) => t.id === id)
      resolve(team)
    }, 100)
  })
}

export const getTeamsByDepartment = async (): Promise<Map<string, Team[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deptMap = new Map<string, Team[]>()
      teams.forEach((team) => {
        const dept = team.department
        if (!deptMap.has(dept)) {
          deptMap.set(dept, [])
        }
        deptMap.get(dept)!.push(team)
      })
      resolve(deptMap)
    }, 100)
  })
}

export const searchTeams = async (query: string): Promise<Team[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase()
      const filtered = teams.filter(
        (team) =>
          team.name.toLowerCase().includes(lowerQuery) ||
          team.description.toLowerCase().includes(lowerQuery) ||
          team.department.toLowerCase().includes(lowerQuery) ||
          team.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      resolve(filtered)
    }, 100)
  })
}
