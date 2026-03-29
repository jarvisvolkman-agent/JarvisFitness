import type { Profile } from "./types";

export const seededProfile: Omit<Profile, "updatedAt"> = {
  id: "default",
  fullName: "Demo Athlete",
  age: 34,
  sex: "female",
  heightCm: 168,
  weightKg: 72,
  activityLevel: "moderately_active",
  dietStyle: "high-protein omnivore",
  workoutDaysPerWeek: 4,
  calorieTarget: 2100,
  proteinTargetG: 145,
  equipmentAccess: "full gym + adjustable dumbbells at home",
  injuries: "occasional right knee irritation under high impact",
  allergies: "none",
  notes: "MVP seed profile for local testing"
};
