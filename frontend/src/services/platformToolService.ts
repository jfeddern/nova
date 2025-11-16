import platformToolsData from '@/data/platformTools.json'
import clustersData from '@/data/clusters.json'
import { PlatformTool, Cluster } from '@/types/platformTool'

const platformTools: PlatformTool[] = platformToolsData as PlatformTool[]
const clusters: Cluster[] = clustersData as Cluster[]

export const getPlatformTools = async (): Promise<PlatformTool[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(platformTools), 100)
  })
}

export const getPlatformToolById = async (id: string): Promise<PlatformTool> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tool = platformTools.find((t) => t.id === id)
      if (!tool) {
        reject(new Error(`Platform tool with id "${id}" not found`))
      } else {
        resolve(tool)
      }
    }, 100)
  })
}

export const getClusters = async (): Promise<Cluster[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(clusters), 100)
  })
}

export const getClusterById = async (id: string): Promise<Cluster> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const cluster = clusters.find((c) => c.id === id)
      if (!cluster) {
        reject(new Error(`Cluster with id "${id}" not found`))
      } else {
        resolve(cluster)
      }
    }, 100)
  })
}
