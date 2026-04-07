/**
 * User-facing API surface. Swap implementation via env without changing pages.
 */
import { apiRequest, isApiConfigured } from './client'
import type {
  DashboardPayload,
  ProjectPreference,
  ProjectProfile,
  PublicUserProfile,
  UserProfile,
} from '../types'
import * as mock from '../mocks/peermatchMock'

const USER = '/users/me'
const PROJECT = '/projects/me'
const PREFERENCES = '/users/me/project-preferences'
const DASHBOARD = '/users/me/dashboard'
const MATCH = '/match/run'

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!isApiConfigured()) return mock.getUserProfile()
  return apiRequest<UserProfile | null>(USER)
}

export async function saveUserProfile(
  profile: UserProfile
): Promise<UserProfile> {
  if (!isApiConfigured()) return mock.saveUserProfile(profile)
  return apiRequest<UserProfile>(USER, { method: 'PUT', json: profile })
}

export async function getProjectProfile(): Promise<ProjectProfile | null> {
  if (!isApiConfigured()) return mock.getProjectProfile()
  return apiRequest<ProjectProfile | null>(PROJECT)
}

export async function saveProjectProfile(
  project: ProjectProfile
): Promise<ProjectProfile> {
  if (!isApiConfigured()) return mock.saveProjectProfile(project)
  return apiRequest<ProjectProfile>(PROJECT, { method: 'PUT', json: project })
}

export async function listCatalogProjects(): Promise<ProjectProfile[]> {
  if (!isApiConfigured()) return mock.listCatalogProjects()
  return apiRequest<ProjectProfile[]>('/projects')
}

/** Directory of classmates (public fields only). */
export async function listPublicUserProfiles(): Promise<PublicUserProfile[]> {
  if (!isApiConfigured()) return mock.listPublicUserProfiles()
  return apiRequest<PublicUserProfile[]>('/users/directory')
}

export async function saveProjectPreferences(
  prefs: ProjectPreference[]
): Promise<ProjectPreference[]> {
  if (!isApiConfigured()) return mock.saveProjectPreferences(prefs)
  return apiRequest<ProjectPreference[]>(PREFERENCES, {
    method: 'PUT',
    json: { preferences: prefs },
  })
}

export async function getProjectPreferences(): Promise<ProjectPreference[]> {
  if (!isApiConfigured()) return mock.getProjectPreferences()
  return apiRequest<ProjectPreference[]>(PREFERENCES)
}

export async function getDashboard(): Promise<DashboardPayload> {
  if (!isApiConfigured()) return mock.getDashboard()
  return apiRequest<DashboardPayload>(DASHBOARD)
}

/** Backend hook: trigger matching / Spark job */
export async function triggerMatching(): Promise<{ jobId: string }> {
  if (!isApiConfigured()) return mock.triggerMatching()
  return apiRequest<{ jobId: string }>(MATCH, { method: 'POST' })
}
