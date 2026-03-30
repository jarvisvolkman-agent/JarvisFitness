const BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${response.status}: ${text}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export type ActivityLevel = 'Sedentary' | 'LightlyActive' | 'ModeratelyActive' | 'VeryActive'
export type GoalCategory = 'Weight' | 'Performance' | 'Nutrition' | 'Habit'
export type GoalStatus = 'Active' | 'Paused' | 'Completed'
export type ItemKind = 'Preference' | 'Constraint'
export type PreferenceCategory = 'Nutrition' | 'Training' | 'Schedule' | 'Medical' | 'Lifestyle'

export interface Profile {
  id: number
  fullName: string
  age: number | null
  sex: string | null
  heightCm: number | null
  weightKg: number | null
  activityLevel: ActivityLevel
  dietStyle: string | null
  workoutDaysPerWeek: number | null
  calorieTarget: number | null
  proteinTargetG: number | null
  equipmentAccess: string | null
  injuries: string | null
  allergies: string | null
  notes: string | null
  updatedAt: string
}

export interface Goal {
  id: number
  category: GoalCategory
  title: string
  targetValue: number | null
  unit: string | null
  timeframe: string | null
  status: GoalStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PreferenceItem {
  id: number
  kind: ItemKind
  category: PreferenceCategory
  label: string
  value: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CheckIn {
  id: number
  checkInDate: string
  weightKg: number | null
  caloriesAvg: number | null
  proteinGAvg: number | null
  trainingSessions: number | null
  energy: number | null
  adherence: number | null
  notes: string | null
  createdAt: string
}

export interface DashboardMetrics {
  activeGoalsCount: number
  completedGoalsCount: number
  constraintsCount: number
  preferencesCount: number
  checkInCount: number
  latestWeightKg: number | null
  latestEnergy: number | null
  latestAdherence: number | null
  weightChangeKg: number | null
}

export interface DashboardSummary {
  profile: Profile | null
  metrics: DashboardMetrics
  activeGoals: Goal[]
  constraints: PreferenceItem[]
  recentCheckIns: CheckIn[]
}

export interface SearchResult {
  entityType: string
  entityId: number
  title: string
  matchField: string
  matchSnippet: string
}

export interface ProfilePayload {
  fullName: string
  age: number | null
  sex: string | null
  heightCm: number | null
  weightKg: number | null
  activityLevel: ActivityLevel
  dietStyle: string | null
  workoutDaysPerWeek: number | null
  calorieTarget: number | null
  proteinTargetG: number | null
  equipmentAccess: string | null
  injuries: string | null
  allergies: string | null
  notes: string | null
}

export interface GoalPayload {
  category: GoalCategory
  title: string
  targetValue: number | null
  unit: string | null
  timeframe: string | null
  status: GoalStatus
  notes: string | null
}

export interface PreferencePayload {
  kind: ItemKind
  category: PreferenceCategory
  label: string
  value: string | null
  notes: string | null
}

export interface CheckInPayload {
  checkInDate: string
  weightKg: number | null
  caloriesAvg: number | null
  proteinGAvg: number | null
  trainingSessions: number | null
  energy: number | null
  adherence: number | null
  notes: string | null
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  profile: {
    get: () => request<{ profile: Profile | null }>('/profile'),
    upsert: (data: ProfilePayload) => request<{ profile: Profile }>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
  goals: {
    list: () => request<{ goals: Goal[] }>('/goals'),
    create: (data: GoalPayload) => request<{ goal: Goal }>('/goals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<GoalPayload>) => request<{ goal: Goal }>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
  },
  preferences: {
    list: (kind?: ItemKind) => request<{ items: PreferenceItem[] }>(`/preferences${kind ? `?kind=${kind}` : ''}`),
    create: (data: PreferencePayload) => request<{ item: PreferenceItem }>('/preferences', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<PreferencePayload>) => request<{ item: PreferenceItem }>(`/preferences/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/preferences/${id}`, { method: 'DELETE' }),
  },
  checkIns: {
    list: () => request<{ checkIns: CheckIn[] }>('/check-ins'),
    create: (data: CheckInPayload) => request<{ checkIn: CheckIn }>('/check-ins', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<CheckInPayload>) => request<{ checkIn: CheckIn }>(`/check-ins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/check-ins/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    summary: () => request<DashboardSummary>('/dashboard/summary'),
  },
  export: () => request<Record<string, unknown>>('/export'),
  search: (q: string) => request<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
}
