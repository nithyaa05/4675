import type {
  DashboardPayload,
  ProjectPreference,
  ProjectProfile,
  PublicUserProfile,
  TeamAssignment,
  UserProfile,
} from '../types'
import { MOCK_CATALOG, MOCK_PEER_DIRECTORY, MOCK_ROSTER } from './seedData'

const LS_USER = 'peermatch:user'
const LS_PROJECT = 'peermatch:projectOwner'
const LS_PREFS = 'peermatch:prefs'

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getUserProfile(): Promise<UserProfile | null> {
  return Promise.resolve(load<UserProfile>(LS_USER))
}

export function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  try {
    const withId = { ...profile, id: profile.id ?? 'me' }
    save(LS_USER, withId)
    return Promise.resolve(withId)
  } catch {
    return Promise.reject(
      new Error(
        'Could not save to browser storage (blocked, full, or private mode).'
      )
    )
  }
}

export function listPublicUserProfiles(): Promise<PublicUserProfile[]> {
  return Promise.resolve(MOCK_PEER_DIRECTORY)
}

export function getProjectProfile(): Promise<ProjectProfile | null> {
  return Promise.resolve(load<ProjectProfile>(LS_PROJECT))
}

export function saveProjectProfile(
  project: ProjectProfile
): Promise<ProjectProfile> {
  const withId = { ...project, id: project.id ?? 'project-owner' }
  save(LS_PROJECT, withId)
  return Promise.resolve(withId)
}

export function listCatalogProjects(): Promise<ProjectProfile[]> {
  return Promise.resolve(MOCK_CATALOG)
}

export function getProjectPreferences(): Promise<ProjectPreference[]> {
  return Promise.resolve(load<ProjectPreference[]>(LS_PREFS) ?? [])
}

export function saveProjectPreferences(
  prefs: ProjectPreference[]
): Promise<ProjectPreference[]> {
  save(LS_PREFS, prefs)
  return Promise.resolve(prefs)
}

function buildMockAssignment(
  user: UserProfile | null
): TeamAssignment | null {
  if (!user) return null
  const project = MOCK_CATALOG[0]
  const peers = MOCK_ROSTER.filter((p) => p.userId !== 'me').slice(0, 3)
  return {
    teamId: 'team-demo-1',
    projectId: project.id ?? 'p1',
    projectTitle: project.title,
    members: peers,
    metrics: {
      averageTeamSimilarity: 0.78,
      skillCoverage: 0.86,
      preferenceSatisfaction: 0.72,
      availabilityOverlap: 0.64,
    },
  }
}

export function getDashboard(): Promise<DashboardPayload> {
  const userProfile = load<UserProfile>(LS_USER)
  const assignment = buildMockAssignment(userProfile)
  const suggestedPeers = MOCK_ROSTER.filter((p) => p.userId !== 'me').slice(
    0,
    8
  )
  return Promise.resolve({
    userProfile,
    assignment,
    suggestedPeers,
  })
}

export function triggerMatching(): Promise<{ jobId: string }> {
  return Promise.resolve({ jobId: `mock-${Date.now()}` })
}
