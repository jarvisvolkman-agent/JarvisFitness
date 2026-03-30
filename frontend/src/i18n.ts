import type {
  ActivityLevel,
  CheckIn,
  DashboardSummary,
  Goal,
  GoalCategory,
  GoalStatus,
  ItemKind,
  PreferenceCategory,
  PreferenceItem,
  Profile,
  SearchResult,
} from './api'

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

export const itemKindLabels: Record<ItemKind, string> = {
  Preference: 'Preference',
  Constraint: 'Omezení',
}

export const preferenceCategoryLabels: Record<PreferenceCategory, string> = {
  Nutrition: 'Výživa',
  Training: 'Trénink',
  Schedule: 'Rozvrh',
  Medical: 'Zdraví',
  Lifestyle: 'Životní styl',
}

export const entityTypeLabels: Record<string, string> = {
  goal: 'Cíl',
  preference: 'Preference',
  constraint: 'Omezení',
  'check-in': 'Kontrola',
  profile: 'Profil',
}

export const matchFieldLabels: Record<string, string> = {
  cil: 'Cíl',
  preference: 'Preference',
  omezeni: 'Omezení',
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

function translatePreference(item: PreferenceItem) {
  return {
    Id: item.id,
    Typ: itemKindLabels[item.kind],
    Kategorie: preferenceCategoryLabels[item.category],
    Název: item.label,
    Hodnota: item.value,
    Poznámky: item.notes,
    Vytvořeno: item.createdAt,
    Aktualizováno: item.updatedAt,
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
    'Energie': checkIn.energy,
    Dodržení: checkIn.adherence,
    Poznámky: checkIn.notes,
    Vytvořeno: checkIn.createdAt,
  }
}

export function createLocalizedExport(summary: DashboardSummary | null, goals: Goal[], preferences: PreferenceItem[], checkIns: CheckIn[]) {
  return JSON.stringify(
    {
      Profil: translateProfile(summary?.profile ?? null),
      Metriky: summary
        ? {
            'Aktivní cíle': summary.metrics.activeGoalsCount,
            'Splněné cíle': summary.metrics.completedGoalsCount,
            Omezení: summary.metrics.constraintsCount,
            Preference: summary.metrics.preferencesCount,
            Kontroly: summary.metrics.checkInCount,
            'Poslední hmotnost (kg)': summary.metrics.latestWeightKg,
            'Poslední energie': summary.metrics.latestEnergy,
            'Poslední dodržení': summary.metrics.latestAdherence,
            'Změna hmotnosti (kg)': summary.metrics.weightChangeKg,
          }
        : null,
      Cile: goals.map(translateGoal),
      PreferenceAOmezeni: preferences.map(translatePreference),
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
