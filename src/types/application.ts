import { Datastore } from './datastore'

export type HealthStatus = 'healthy' | 'degraded' | 'critical'

export interface Application {
  id: string
  name: string
  description: string
  brief: string
  department: string
  domain: string
  owner: Owner
  environment: string
  criticality: 'P1' | 'P2' | 'P3'
  health: HealthStatus
  tags: string[]
  dependencies: string[]
  datastores: Datastore[]
  links: Links
  customLinks: CustomLink[]
}

export interface Owner {
  team: string
  contact_email: string
  teams_channel: string
}

export interface Links {
  repository: string
  documentation: string
  monitoring: string
}

export interface CustomLink {
  title: string
  url: string
}
