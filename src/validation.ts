import { z } from "zod";

const nullableString = z.string().trim().max(500).nullable().default(null);
const nullableNumber = z.coerce.number().finite().nullable().default(null);

export const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  age: z.coerce.number().int().min(13).max(100).nullable().default(null),
  sex: z.string().trim().max(40).nullable().default(null),
  heightCm: z.coerce.number().min(100).max(260).nullable().default(null),
  weightKg: z.coerce.number().min(30).max(400).nullable().default(null),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active"
  ]),
  dietStyle: z.string().trim().max(80).nullable().default(null),
  workoutDaysPerWeek: z.coerce.number().int().min(0).max(14).nullable().default(null),
  calorieTarget: z.coerce.number().int().min(800).max(7000).nullable().default(null),
  proteinTargetG: z.coerce.number().int().min(20).max(400).nullable().default(null),
  equipmentAccess: nullableString,
  injuries: nullableString,
  allergies: nullableString,
  notes: nullableString
});

export const goalSchema = z.object({
  category: z.enum(["weight", "performance", "nutrition", "habit"]),
  title: z.string().trim().min(1).max(160),
  targetValue: nullableNumber,
  unit: z.string().trim().max(30).nullable().default(null),
  timeframe: z.string().trim().max(80).nullable().default(null),
  status: z.enum(["active", "paused", "completed"]).default("active"),
  notes: nullableString
});

export const preferenceSchema = z.object({
  kind: z.enum(["preference", "constraint"]),
  category: z.enum(["nutrition", "training", "schedule", "medical", "lifestyle"]),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().max(200).nullable().default(null),
  notes: nullableString
});

export const checkInSchema = z.object({
  checkInDate: z.string().date(),
  weightKg: z.coerce.number().min(30).max(400).nullable().default(null),
  caloriesAvg: z.coerce.number().int().min(0).max(10000).nullable().default(null),
  proteinGAvg: z.coerce.number().int().min(0).max(1000).nullable().default(null),
  trainingSessions: z.coerce.number().int().min(0).max(21).nullable().default(null),
  energy: z.coerce.number().int().min(1).max(10).nullable().default(null),
  adherence: z.coerce.number().int().min(1).max(10).nullable().default(null),
  notes: nullableString
});

export const queryKindSchema = z.enum(["preference", "constraint"]).optional();
