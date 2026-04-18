
import type {
  DashboardPayload,
  ProjectPreference,
  ProjectProfile,
  PublicUserProfile,
  TeamAssignment,
  TeamMemberPreview,
  UserProfile,
} from '../types'

import * as mock from '../mocks/peermatchMock'


const BASE_URL = 'http://localhost:5000/api'


// -------------------- USER --------------------

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

// -------------------- PROJECT --------------------

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

// -------------------- PREFERENCES --------------------

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

// -------------------- MOCKED (KEEP FOR NOW) --------------------

export async function listPublicUserProfiles(): Promise<PublicUserProfile[]> {
  const res = await fetch(`${BASE_URL}/users`)
  if (!res.ok) return []
  const users = await res.json()
  // Convert UserProfile data to PublicUserProfile format
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

export async function getDashboard(): Promise<DashboardPayload> {
  const userProfile = await getUserProfile()

  return {
    userProfile,
    assignment: null as TeamAssignment | null,
    suggestedPeers: [],
  }
}

export async function triggerMatching(): Promise<{ jobId: string }> {
  return { jobId: `job-${Date.now()}` }
}

// /**
//  * User-facing API surface. Swap implementation via env without changing pages.
//  */
// import { apiRequest, isApiConfigured } from './client'
// import type {
//   DashboardPayload,
//   ProjectPreference,
//   ProjectProfile,
//   PublicUserProfile,
//   UserProfile,
// } from '../types'
// import * as mock from '../mocks/peermatchMock'

// const USER = '/users/me'
// const PROJECT = '/projects/me'
// const PREFERENCES = '/users/me/project-preferences'
// const DASHBOARD = '/users/me/dashboard'
// const MATCH = '/match/run'
// export async function getUserProfile(): Promise<UserProfile | null> {
//   return mock.getUserProfile()
// }

// export async function saveUserProfile(
//   profile: UserProfile
// ): Promise<UserProfile> {
//   if (!isApiConfigured()) return mock.saveUserProfile(profile)
//   return apiRequest<UserProfile>(USER, { method: 'PUT', json: profile })
// }

// export async function getProjectProfile(): Promise<ProjectProfile | null> {
//   return mock.getProjectProfile()
// }

// export async function saveProjectProfile(
//   project: ProjectProfile
// ): Promise<ProjectProfile> {
//   return mock.saveProjectProfile(project)
// }

// export async function listCatalogProjects(): Promise<ProjectProfile[]> {
//   return mock.listCatalogProjects()
// }

// /** Directory of classmates (public fields only). */
// export async function listPublicUserProfiles(): Promise<PublicUserProfile[]> {
//   return mock.listPublicUserProfiles()
// }

// export async function saveProjectPreferences(
//   prefs: ProjectPreference[]
// ): Promise<ProjectPreference[]> {
//   return mock.saveProjectPreferences(prefs)
// }

// export async function getProjectPreferences(): Promise<ProjectPreference[]> {
//   return mock.getProjectPreferences()
// }

// export async function getDashboard(): Promise<DashboardPayload> {
//   return mock.getDashboard()
// }

// /** Backend hook: trigger matching / Spark job */
// export async function triggerMatching(): Promise<{ jobId: string }> {
//   return mock.triggerMatching()
// }


// // export async function getUserProfile(): Promise<UserProfile | null> {
// //   if (!isApiConfigured()) return mock.getUserProfile()
// //   return apiRequest<UserProfile | null>(USER)
// // }

// // export async function saveUserProfile(
// //   profile: UserProfile
// // ): Promise<UserProfile> {
// //   if (!isApiConfigured()) return mock.saveUserProfile(profile)
// //   return apiRequest<UserProfile>(USER, { method: 'PUT', json: profile })
// // }

// // export async function getProjectProfile(): Promise<ProjectProfile | null> {
// //   if (!isApiConfigured()) return mock.getProjectProfile()
// //   return apiRequest<ProjectProfile | null>(PROJECT)
// // }

// // export async function saveProjectProfile(
// //   project: ProjectProfile
// // ): Promise<ProjectProfile> {
// //   if (!isApiConfigured()) return mock.saveProjectProfile(project)
// //   return apiRequest<ProjectProfile>(PROJECT, { method: 'PUT', json: project })
// // }

// // export async function listCatalogProjects(): Promise<ProjectProfile[]> {
// //   if (!isApiConfigured()) return mock.listCatalogProjects()
// //   return apiRequest<ProjectProfile[]>('/projects')
// // }

// // /** Directory of classmates (public fields only). */
// // export async function listPublicUserProfiles(): Promise<PublicUserProfile[]> {
// //   if (!isApiConfigured()) return mock.listPublicUserProfiles()
// //   return apiRequest<PublicUserProfile[]>('/users/directory')
// // }

// // export async function saveProjectPreferences(
// //   prefs: ProjectPreference[]
// // ): Promise<ProjectPreference[]> {
// //   if (!isApiConfigured()) return mock.saveProjectPreferences(prefs)
// //   return apiRequest<ProjectPreference[]>(PREFERENCES, {
// //     method: 'PUT',
// //     json: { preferences: prefs },
// //   })
// // }

// // export async function getProjectPreferences(): Promise<ProjectPreference[]> {
// //   if (!isApiConfigured()) return mock.getProjectPreferences()
// //   return apiRequest<ProjectPreference[]>(PREFERENCES)
// // }

// // export async function getDashboard(): Promise<DashboardPayload> {
// //   if (!isApiConfigured()) return mock.getDashboard()
// //   return apiRequest<DashboardPayload>(DASHBOARD)
// // }

// // /** Backend hook: trigger matching / Spark job */
// // export async function triggerMatching(): Promise<{ jobId: string }> {
// //   if (!isApiConfigured()) return mock.triggerMatching()
// //   return apiRequest<{ jobId: string }>(MATCH, { method: 'POST' })
// // }

