import type {
  ActivityLevel,
  CheckIn,
  CheckInPayload,
  DashboardSummary,
  Goal,
  GoalCategory,
  GoalPayload,
  GoalStatus,
  Profile,
  ProfilePayload,
  TrainingPlan,
  TrainingPlanPayload,
  WorkoutEntry,
  WorkoutEntryPayload,
  WorkoutStatus,
} from './api'
import { activityLevelLabels, formatMetricValue, goalStatusLabels, workoutStatusLabels } from './i18n'

export const activityLevels: ActivityLevel[] = ['Sedentary', 'LightlyActive', 'ModeratelyActive', 'VeryActive']
export const goalCategories: GoalCategory[] = ['Weight', 'Performance', 'Nutrition', 'Habit']
export const goalStatuses: GoalStatus[] = ['Active', 'Paused', 'Completed']
export const workoutStatuses: WorkoutStatus[] = ['Planned', 'Completed', 'Missed']

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

export const emptyTrainingPlan: TrainingPlanPayload = {
  title: '',
  focus: null,
  startDate: todayIso(),
  endDate: null,
  isActive: true,
  notes: null,
}

export const emptyWorkout: WorkoutEntryPayload = {
  trainingPlanId: null,
  title: '',
  workoutType: null,
  scheduledDate: todayIso(),
  completedDate: null,
  durationMinutes: null,
  status: 'Planned',
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

export function trainingPlanToPayload(plan: TrainingPlan): TrainingPlanPayload {
  return {
    title: plan.title,
    focus: plan.focus,
    startDate: plan.startDate,
    endDate: plan.endDate,
    isActive: plan.isActive,
    notes: plan.notes,
  }
}

export function workoutToPayload(workout: WorkoutEntry): WorkoutEntryPayload {
  return {
    trainingPlanId: workout.trainingPlanId,
    title: workout.title,
    workoutType: workout.workoutType,
    scheduledDate: workout.scheduledDate,
    completedDate: workout.completedDate,
    durationMinutes: workout.durationMinutes,
    status: workout.status,
    notes: workout.notes,
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
      { label: 'Aktivní plány', value: String(summary?.metrics.activeTrainingPlansCount ?? 0) },
      { label: 'Plánované tréninky', value: String(summary?.metrics.plannedWorkoutsCount ?? 0) },
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

export function workoutBadgeClass(status: WorkoutStatus) {
  if (status === 'Completed') return 'badge badge-active'
  if (status === 'Missed') return 'badge badge-warning'
  return 'badge badge-info'
}

export function describeCheckIn(checkIn: CheckIn) {
  const bits = [
    checkIn.weightKg != null ? `${checkIn.weightKg} kg` : null,
    checkIn.energy != null ? `energie ${checkIn.energy}/10` : null,
    checkIn.adherence != null ? `dodržení ${checkIn.adherence}/10` : null,
  ].filter(Boolean)

  return bits.length > 0 ? bits.join(' • ') : 'Bez hlavních metrik'
}

export function describeWorkout(workout: WorkoutEntry) {
  const bits = [
    workout.workoutType,
    workout.durationMinutes != null ? `${workout.durationMinutes} min` : null,
    workout.trainingPlanTitle,
    workoutStatusLabels[workout.status],
  ].filter(Boolean)

  return bits.join(' • ')
}
