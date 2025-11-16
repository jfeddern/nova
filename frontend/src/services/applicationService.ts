import applicationsData from '@/data/applications.json'
import { Application } from '@/types/application'

const applications: Application[] = applicationsData as Application[]

export const getApplications = async (): Promise<Application[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(applications), 100)
  })
}

export const getApplicationById = async (id: string): Promise<Application> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const app = applications.find((app) => app.id === id)
      if (!app) {
        reject(new Error(`Application with id "${id}" not found`))
      } else {
        resolve(app)
      }
    }, 100)
  })
}

export const getApplicationsByTeam = async (): Promise<Map<string, Application[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const teamMap = new Map<string, Application[]>()
      applications.forEach((app) => {
        const team = app.owner.team
        if (!teamMap.has(team)) {
          teamMap.set(team, [])
        }
        teamMap.get(team)!.push(app)
      })
      resolve(teamMap)
    }, 100)
  })
}

export const getApplicationsByDepartment = async (): Promise<Map<string, Application[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const deptMap = new Map<string, Application[]>()
      applications.forEach((app) => {
        const dept = app.department
        if (!deptMap.has(dept)) {
          deptMap.set(dept, [])
        }
        deptMap.get(dept)!.push(app)
      })
      resolve(deptMap)
    }, 100)
  })
}
