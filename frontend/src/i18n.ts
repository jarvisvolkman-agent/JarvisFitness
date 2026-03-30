import type { ActivityLevel, CheckIn, DashboardSummary, Goal, GoalCategory, GoalStatus, Profile, SearchResult, TrainingPlan, WorkoutEntry, WorkoutStatus } from './api'

export const activityLevelLabels: Record<ActivityLevel, string> = {
  Sedentary: 'Sedavý režim',
  LightlyActive: 'Lehce aktivní',
  ModeratelyActive: 'Středně aktivní',
  VeryActive: 'Velmi aktivní',
}

export const goalCategoryLabels: Record<GoalCategory, string> = {
  Weight: 'Hmotnost',
  Performance: 'Výkon',
  Nutrition: 'Výživa',
  Habit: 'Návyk',
}

export const goalStatusLabels: Record<GoalStatus, string> = {
  Active: 'Aktivní',
  Paused: 'Pozastavený',
  Completed: 'Splněný',
}

export const workoutStatusLabels: Record<WorkoutStatus, string> = {
  Planned: 'Plánovaný',
  Completed: 'Odcvičený',
  Missed: 'Nevyšel',
}

export const entityTypeLabels: Record<string, string> = {
  goal: 'Cíl',
  'training-plan': 'Tréninkový plán',
  'planned-workout': 'Plánovaný trénink',
  'completed-workout': 'Odcvičený trénink',
  'check-in': 'Kontrola',
  profile: 'Profil',
}

export const matchFieldLabels: Record<string, string> = {
  cil: 'Cíl',
  plan: 'Plán',
  'planovany-trenink': 'Plánovaný trénink',
  'odcviceny-trenink': 'Odcvičený trénink',
  poznamky: 'Poznámky',
  profil: 'Profil',
}

function translateProfile(profile: Profile | null) {
  if (!profile) return null

  return {
    'Celé jméno': profile.fullName,
    Věk: profile.age,
    Pohlaví: profile.sex,
    'Výška (cm)': profile.heightCm,
    'Hmotnost (kg)': profile.weightKg,
    'Úroveň aktivity': activityLevelLabels[profile.activityLevel],
    'Stravovací styl': profile.dietStyle,
    'Tréninkové dny týdně': profile.workoutDaysPerWeek,
    'Kalorický cíl': profile.calorieTarget,
    'Bílkovinový cíl (g)': profile.proteinTargetG,
    'Dostupné vybavení': profile.equipmentAccess,
    Zranění: profile.injuries,
    Alergie: profile.allergies,
    Poznámky: profile.notes,
    'Aktualizováno': profile.updatedAt,
  }
}

function translateGoal(goal: Goal) {
  return {
    Id: goal.id,
    Kategorie: goalCategoryLabels[goal.category],
    Název: goal.title,
    'Cílová hodnota': goal.targetValue,
    Jednotka: goal.unit,
    Období: goal.timeframe,
    Stav: goalStatusLabels[goal.status],
    Poznámky: goal.notes,
    Vytvořeno: goal.createdAt,
    Aktualizováno: goal.updatedAt,
  }
}

function translateTrainingPlan(plan: TrainingPlan) {
  return {
    Id: plan.id,
    Název: plan.title,
    Zaměření: plan.focus,
    'Začátek': plan.startDate,
    Konec: plan.endDate,
    Aktivní: plan.isActive ? 'ano' : 'ne',
    'Plánované tréninky': plan.plannedWorkoutCount,
    'Odcvičené tréninky': plan.completedWorkoutCount,
    Poznámky: plan.notes,
    Vytvořeno: plan.createdAt,
    Aktualizováno: plan.updatedAt,
  }
}

function translateWorkout(workout: WorkoutEntry) {
  return {
    Id: workout.id,
    Název: workout.title,
    'Typ tréninku': workout.workoutType,
    'Tréninkový plán': workout.trainingPlanTitle,
    'Plánované datum': workout.scheduledDate,
    'Datum odcvičení': workout.completedDate,
    'Délka (min)': workout.durationMinutes,
    Stav: workoutStatusLabels[workout.status],
    Poznámky: workout.notes,
    Vytvořeno: workout.createdAt,
    Aktualizováno: workout.updatedAt,
  }
}

function translateCheckIn(checkIn: CheckIn) {
  return {
    Id: checkIn.id,
    Datum: checkIn.checkInDate,
    'Hmotnost (kg)': checkIn.weightKg,
    'Průměr kalorií': checkIn.caloriesAvg,
    'Průměr bílkovin (g)': checkIn.proteinGAvg,
    'Počet tréninků': checkIn.trainingSessions,
    Energie: checkIn.energy,
    Dodržení: checkIn.adherence,
    Poznámky: checkIn.notes,
    Vytvořeno: checkIn.createdAt,
  }
}

export function createLocalizedExport(summary: DashboardSummary | null, goals: Goal[], trainingPlans: TrainingPlan[], workouts: WorkoutEntry[], checkIns: CheckIn[]) {
  return JSON.stringify(
    {
      Profil: translateProfile(summary?.profile ?? null),
      Metriky: summary
        ? {
            'Aktivní cíle': summary.metrics.activeGoalsCount,
            'Splněné cíle': summary.metrics.completedGoalsCount,
            'Kontroly': summary.metrics.checkInCount,
            'Aktivní tréninkové plány': summary.metrics.activeTrainingPlansCount,
            'Plánované tréninky': summary.metrics.plannedWorkoutsCount,
            'Odcvičené tréninky': summary.metrics.completedWorkoutsCount,
            'Poslední hmotnost (kg)': summary.metrics.latestWeightKg,
            'Poslední energie': summary.metrics.latestEnergy,
            'Poslední dodržení': summary.metrics.latestAdherence,
            'Změna hmotnosti (kg)': summary.metrics.weightChangeKg,
          }
        : null,
      Cile: goals.map(translateGoal),
      TreningovePlany: trainingPlans.map(translateTrainingPlan),
      Treningy: workouts.map(translateWorkout),
      Kontroly: checkIns.map(translateCheckIn),
    },
    null,
    2,
  )
}

export function getEntityTypeLabel(entityType: SearchResult['entityType']) {
  return entityTypeLabels[entityType] ?? entityType
}

export function getMatchFieldLabel(matchField: SearchResult['matchField']) {
  return matchFieldLabels[matchField] ?? matchField
}

export function formatGoalTarget(goal: Goal) {
  if (goal.targetValue == null) return 'Bez cílové hodnoty'
  return goal.unit ? `${goal.targetValue} ${goal.unit}` : String(goal.targetValue)
}

export function formatMetricValue(value: number | null | undefined, suffix?: string) {
  if (value == null) return 'Není k dispozici'
  return suffix ? `${value}${suffix}` : String(value)
}

export function formatCheckInWeight(weightKg: number | null) {
  return weightKg == null ? 'Bez hmotnosti' : `${weightKg} kg`
}
