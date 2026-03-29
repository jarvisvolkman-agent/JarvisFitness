export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";

export type GoalCategory = "weight" | "performance" | "nutrition" | "habit";
export type GoalStatus = "active" | "paused" | "completed";
export type ItemKind = "preference" | "constraint";
export type PreferenceCategory =
  | "nutrition"
  | "training"
  | "schedule"
  | "medical"
  | "lifestyle";

export interface Profile {
  id: string;
  fullName: string;
  age: number | null;
  sex: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel;
  dietStyle: string | null;
  workoutDaysPerWeek: number | null;
  calorieTarget: number | null;
  proteinTargetG: number | null;
  equipmentAccess: string | null;
  injuries: string | null;
  allergies: string | null;
  notes: string | null;
  updatedAt: string;
}

export interface Goal {
  id: number;
  category: GoalCategory;
  title: string;
  targetValue: number | null;
  unit: string | null;
  timeframe: string | null;
  status: GoalStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreferenceItem {
  id: number;
  kind: ItemKind;
  category: PreferenceCategory;
  label: string;
  value: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: number;
  checkInDate: string;
  weightKg: number | null;
  caloriesAvg: number | null;
  proteinGAvg: number | null;
  trainingSessions: number | null;
  energy: number | null;
  adherence: number | null;
  notes: string | null;
  createdAt: string;
}
