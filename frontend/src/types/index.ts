/** Shared types — align field names with Flask / DB schemas when backend lands. */

export type DaySlot = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** Legacy shape; prefer weeklyAvailability on UserProfile. */
export interface AvailabilityBlock {
  day: DaySlot
  /** 0–24 hour, e.g. 14 = 2pm */
  startHour: number
  endHour: number
}

/** Directory / classmates view — omit sensitive fields as your API requires. */
export interface PublicUserProfile {
  userId: string
  displayName: string
  email?: string
  major: string
  skills: string[]
  workingStyle: string
  bio?: string
  /** Human-readable summary; detailed grid stays on full profile API if exposed */
  availabilitySummary?: string
}

export interface UserProfile {
  id?: string
  displayName: string
  email: string
  major: string
  skills: string[]
  /**
   * Half-hour grid, 9:00–21:00 per day (24 slots per day). Only set slots to
   * true when free; other days/times stay false. Sparse schedules are valid.
   */
  weeklyAvailability: Record<DaySlot, boolean[]>
  workingStyle: string
  /** Peer user IDs or emails the student prefers */
  preferredPeerIds: string[]
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
  /** Optional roles the course wants represented */
  teamRoles?: string[]
}

export interface ProjectPreference {
  projectId: string
  /** Order among your chosen projects only: 1 = top pick */
  rank: number
  /** How strongly you want this project (1 = low … 5 = high) */
  rating: number
}

export interface TeamMemberPreview {
  userId: string
  displayName: string
  major: string
  skills: string[]
  /** 0–1 similarity with current user */
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
