import type {
  ActivityLevel,
  CheckIn,
  CheckInPayload,
  DashboardSummary,
  Goal,
  GoalCategory,
  GoalPayload,
  GoalStatus,
  ItemKind,
  PreferenceCategory,
  PreferenceItem,
  PreferencePayload,
  Profile,
  ProfilePayload,
} from './api'
import {
  activityLevelLabels,
  formatMetricValue,
  goalStatusLabels,
  itemKindLabels,
  preferenceCategoryLabels,
} from './i18n'

export const activityLevels: ActivityLevel[] = ['Sedentary', 'LightlyActive', 'ModeratelyActive', 'VeryActive']
export const goalCategories: GoalCategory[] = ['Weight', 'Performance', 'Nutrition', 'Habit']
export const goalStatuses: GoalStatus[] = ['Active', 'Paused', 'Completed']
export const itemKinds: ItemKind[] = ['Preference', 'Constraint']
export const preferenceCategories: PreferenceCategory[] = ['Nutrition', 'Training', 'Schedule', 'Medical', 'Lifestyle']

export const emptyProfile: ProfilePayload = {
  fullName: '',
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  activityLevel: 'ModeratelyActive',
  dietStyle: null,
  workoutDaysPerWeek: null,
  calorieTarget: null,
  proteinTargetG: null,
  equipmentAccess: null,
  injuries: null,
  allergies: null,
  notes: null,
}

export const emptyGoal: GoalPayload = {
  category: 'Weight',
  title: '',
  targetValue: null,
  unit: null,
  timeframe: null,
  status: 'Active',
  notes: null,
}

export const emptyPreference: PreferencePayload = {
  kind: 'Preference',
  category: 'Training',
  label: '',
  value: null,
  notes: null,
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function createEmptyCheckIn(): CheckInPayload {
  return {
    checkInDate: todayIso(),
    weightKg: null,
    caloriesAvg: null,
    proteinGAvg: null,
    trainingSessions: null,
    energy: null,
    adherence: null,
    notes: null,
  }
}

export function asNumber(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function asText(value: string): string | null {
  return value.trim() === '' ? null : value.trim()
}

export function profileToPayload(profile: Profile | null): ProfilePayload {
  if (!profile) return emptyProfile
  return {
    fullName: profile.fullName,
    age: profile.age,
    sex: profile.sex,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel,
    dietStyle: profile.dietStyle,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
    calorieTarget: profile.calorieTarget,
    proteinTargetG: profile.proteinTargetG,
    equipmentAccess: profile.equipmentAccess,
    injuries: profile.injuries,
    allergies: profile.allergies,
    notes: profile.notes,
  }
}

export function goalToPayload(goal: Goal): GoalPayload {
  return {
    category: goal.category,
    title: goal.title,
    targetValue: goal.targetValue,
    unit: goal.unit,
    timeframe: goal.timeframe,
    status: goal.status,
    notes: goal.notes,
  }
}

export function preferenceToPayload(item: PreferenceItem): PreferencePayload {
  return {
    kind: item.kind,
    category: item.category,
    label: item.label,
    value: item.value,
    notes: item.notes,
  }
}

export function checkInToPayload(checkIn: CheckIn): CheckInPayload {
  return {
    checkInDate: checkIn.checkInDate,
    weightKg: checkIn.weightKg,
    caloriesAvg: checkIn.caloriesAvg,
    proteinGAvg: checkIn.proteinGAvg,
    trainingSessions: checkIn.trainingSessions,
    energy: checkIn.energy,
    adherence: checkIn.adherence,
    notes: checkIn.notes,
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Není k dispozici'
  if (value.includes('T')) return new Date(value).toLocaleDateString('cs-CZ')
  const [year, month, day] = value.split('-')
  if (year && month && day) return `${day}.${month}.${year}`
  return value
}

export function profileSnapshot(summary: DashboardSummary | null) {
  if (!summary?.profile) {
    return [
      { label: 'Profil', value: 'Zatím nevyplněný' },
      { label: 'Poslední kontrola', value: summary?.recentCheckIns[0] ? formatDate(summary.recentCheckIns[0].checkInDate) : 'Žádná' },
      { label: 'Aktivní omezení', value: String(summary?.metrics.constraintsCount ?? 0) },
      { label: 'Výživové preference', value: String(summary?.metrics.preferencesCount ?? 0) },
    ]
  }

  return [
    { label: 'Klient', value: summary.profile.fullName },
    { label: 'Aktivita', value: activityLevelLabels[summary.profile.activityLevel] },
    { label: 'Tréninky týdně', value: formatMetricValue(summary.profile.workoutDaysPerWeek) },
    { label: 'Poslední úprava', value: formatDate(summary.profile.updatedAt) },
  ]
}

export function goalBadgeClass(status: GoalStatus) {
  if (status === 'Completed') return 'badge badge-active'
  if (status === 'Paused') return 'badge badge-warning'
  return 'badge badge-info'
}

export function itemBadgeClass(kind: ItemKind) {
  return kind === 'Constraint' ? 'badge badge-warning' : 'badge badge-active'
}

export function describeCheckIn(checkIn: CheckIn) {
  const bits = [
    checkIn.weightKg != null ? `${checkIn.weightKg} kg` : null,
    checkIn.energy != null ? `energie ${checkIn.energy}/10` : null,
    checkIn.adherence != null ? `dodržení ${checkIn.adherence}/10` : null,
  ].filter(Boolean)

  return bits.length > 0 ? bits.join(' • ') : 'Bez hlavních metrik'
}

export function describePreference(item: PreferenceItem) {
  const category = preferenceCategoryLabels[item.category]
  const kind = itemKindLabels[item.kind]
  return `${kind} • ${category}`
}
