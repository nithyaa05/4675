export type DaySlot = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface AvailabilityBlock {
  day: DaySlot
  startHour: number
  endHour: number
}

export interface PublicUserProfile {
  userId: string
  firstName: string
  lastName: string
  email?: string
  major: string
  skills: string[]
  bio?: string
  availabilitySummary?: string
}

export interface UserProfile {
  id?: string
  firstName: string
  lastName: string
  email: string
  major: string
  skills: string[]

  weeklyAvailability: Record<DaySlot, boolean[]>
  preferredPeerIds: string[]
  preferredProjectIds?: string[]
  teamRoles?: string[]
  bio?: string
}

export interface ProjectProfile {
  id?: string
  title: string
  courseCode: string
  description: string
  requiredSkills: string[]
  teamSizeMin: number
  teamSizeMax: number
  teamRoles?: string[]
}

export interface ProjectPreference {
  projectId: string
  rank: number
  rating: number
}

export interface TeamMemberPreview {
  userId: string
  displayName: string
  major: string
  skills: string[]
  compatibilityScore: number
}

export interface TeamAssignment {
  teamId: string
  projectId: string
  projectTitle: string
  members: TeamMemberPreview[]
  /** Aggregate / per-metric scores from matching pipeline */
  metrics: {
    averageTeamSimilarity: number
    skillCoverage: number
    preferenceSatisfaction: number
    availabilityOverlap: number
  }
}

export interface DashboardPayload {
  userProfile: UserProfile | null
  assignment: TeamAssignment | null
  /** Suggested matches before final assignment (optional) */
  suggestedPeers?: TeamMemberPreview[]
}
