
import type {
  DashboardPayload,
  ProjectPreference,
  ProjectProfile,
  PublicUserProfile,
  TeamAssignment,
  TeamMemberPreview,
  UserProfile,
} from '../types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(/\/$/, '')


export async function getUserProfile(): Promise<UserProfile | null> {
  const res = await fetch(`${BASE_URL}/users/me`)
  if (!res.ok) return null
  //console.log(await res.json())
  return await res.json()
  //return {} as UserProfile
  // return mock.getUserProfile()
}

export async function saveUserProfile(
  profile: UserProfile
): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  })

  if (!res.ok) {
    throw new Error('Failed to save user profile')
  }

  return await res.json()
}

export async function getAllUsers(): Promise<TeamMemberPreview[]> {
  const res = await fetch(`${BASE_URL}/users`)
  if (!res.ok) return []
  const users = await res.json()
  // Convert UserProfile data to TeamMemberPreview format
  return users.map((user: any) => ({
    userId: user.userId,
    displayName: `${user.firstName} ${user.lastName}`,
    major: user.major,
    skills: user.skills || [],
    compatibilityScore: 0, // You can calculate this later based on your matching algorithm
  }))
}


export async function getProjectProfile(): Promise<ProjectProfile | null> {
  const res = await fetch(`${BASE_URL}/project-profile`)
  if (!res.ok) return null
  return await res.json()
}

export async function saveProjectProfile(
  project: ProjectProfile
): Promise<ProjectProfile> {
  const res = await fetch(`${BASE_URL}/project-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })

  if (!res.ok) {
    throw new Error('Failed to save project profile')
  }

  return await res.json()
}


export async function getProjectPreferences(): Promise<ProjectPreference[]> {
  const res = await fetch(`${BASE_URL}/preferences`)
  if (!res.ok) return []
  return await res.json()
}

export async function saveProjectPreferences(
  prefs: ProjectPreference[]
): Promise<ProjectPreference[]> {
  const res = await fetch(`${BASE_URL}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  })

  if (!res.ok) {
    throw new Error('Failed to save preferences')
  }

  return await res.json()
}


export async function listPublicUserProfiles(): Promise<PublicUserProfile[]> {
  const res = await fetch(`${BASE_URL}/users`)
  if (!res.ok) return []
  const users = await res.json()
  return users.map((user: any) => ({
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    major: user.major,
    skills: user.skills || [],
    bio: user.bio,
    availabilitySummary: user.availabilitySummary,
  }))
}

export async function listCatalogProjects(): Promise<ProjectProfile[]> {
  const res = await fetch(`${BASE_URL}/projects`)
  if (!res.ok) return []
  return await res.json()
}

export async function getAllAssignments(): Promise<TeamAssignment[]> {
  const res = await fetch(`${BASE_URL}/match/assignments`)
  if (!res.ok) return []
  return await res.json()
}

export async function getDashboard(): Promise<DashboardPayload> {
  const [userProfile, assignment, allAssignments] = await Promise.all([
    getUserProfile(),
    getUserAssignment(),
    getAllAssignments(),
  ])

  return {
    userProfile,
    assignment,
    allAssignments,
    suggestedPeers: [],
  }
}

export async function triggerMatching(): Promise<{ jobId: string }> {
  const res = await fetch(`${BASE_URL}/match/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Failed to trigger matching')
  }

  return await res.json()
}

export async function getUserAssignment(): Promise<TeamAssignment | null> {
  const res = await fetch(`${BASE_URL}/users/me/assignment`)
  if (!res.ok) return null
  return await res.json()
}

