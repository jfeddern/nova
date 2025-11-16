
export interface Team {
  id: string
  name: string
  description: string
  department: string
  contact_email: string
  teams_channel: string
  lead_name: string
  lead_email: string
  member_count: number
  tags: string[]
  customLinks: TeamCustomLink[]
  members?: TeamMember[]
}

export interface TeamCustomLink {
  title: string
  url: string
}

export interface TeamMember {
  name: string
  role: string
  email: string
}
