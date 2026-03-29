import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import { seededProfile } from "./seed";
import type { CheckIn, Goal, PreferenceItem, Profile } from "./types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, "jarvisfitness.db");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    age INTEGER,
    sex TEXT,
    height_cm REAL,
    weight_kg REAL,
    activity_level TEXT NOT NULL,
    diet_style TEXT,
    workout_days_per_week INTEGER,
    calorie_target INTEGER,
    protein_target_g INTEGER,
    equipment_access TEXT,
    injuries TEXT,
    allergies TEXT,
    notes TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    target_value REAL,
    unit TEXT,
    timeframe TEXT,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS preference_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_in_date TEXT NOT NULL,
    weight_kg REAL,
    calories_avg INTEGER,
    protein_g_avg INTEGER,
    training_sessions INTEGER,
    energy INTEGER,
    adherence INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL
  );
`);

function nowIso(): string {
  return new Date().toISOString();
}

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    age: row.age as number | null,
    sex: row.sex as string | null,
    heightCm: row.height_cm as number | null,
    weightKg: row.weight_kg as number | null,
    activityLevel: row.activity_level as Profile["activityLevel"],
    dietStyle: row.diet_style as string | null,
    workoutDaysPerWeek: row.workout_days_per_week as number | null,
    calorieTarget: row.calorie_target as number | null,
    proteinTargetG: row.protein_target_g as number | null,
    equipmentAccess: row.equipment_access as string | null,
    injuries: row.injuries as string | null,
    allergies: row.allergies as string | null,
    notes: row.notes as string | null,
    updatedAt: String(row.updated_at)
  };
}

function mapGoal(row: Record<string, unknown>): Goal {
  return {
    id: Number(row.id),
    category: row.category as Goal["category"],
    title: String(row.title),
    targetValue: row.target_value as number | null,
    unit: row.unit as string | null,
    timeframe: row.timeframe as string | null,
    status: row.status as Goal["status"],
    notes: row.notes as string | null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapPreference(row: Record<string, unknown>): PreferenceItem {
  return {
    id: Number(row.id),
    kind: row.kind as PreferenceItem["kind"],
    category: row.category as PreferenceItem["category"],
    label: String(row.label),
    value: row.value as string | null,
    notes: row.notes as string | null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapCheckIn(row: Record<string, unknown>): CheckIn {
  return {
    id: Number(row.id),
    checkInDate: String(row.check_in_date),
    weightKg: row.weight_kg as number | null,
    caloriesAvg: row.calories_avg as number | null,
    proteinGAvg: row.protein_g_avg as number | null,
    trainingSessions: row.training_sessions as number | null,
    energy: row.energy as number | null,
    adherence: row.adherence as number | null,
    notes: row.notes as string | null,
    createdAt: String(row.created_at)
  };
}

export function seedIfEmpty(): void {
  const profileCount = db.prepare("SELECT COUNT(*) AS count FROM profile").get() as {
    count: number;
  };
  if (profileCount.count > 0) {
    return;
  }

  const timestamp = nowIso();
  db.prepare(`
    INSERT INTO profile (
      id, full_name, age, sex, height_cm, weight_kg, activity_level, diet_style,
      workout_days_per_week, calorie_target, protein_target_g, equipment_access,
      injuries, allergies, notes, updated_at
    ) VALUES (
      @id, @fullName, @age, @sex, @heightCm, @weightKg, @activityLevel, @dietStyle,
      @workoutDaysPerWeek, @calorieTarget, @proteinTargetG, @equipmentAccess,
      @injuries, @allergies, @notes, @updatedAt
    )
  `).run({ ...seededProfile, updatedAt: timestamp });

  const goals = db.prepare(`
    INSERT INTO goals (category, title, target_value, unit, timeframe, status, notes, created_at, updated_at)
    VALUES (@category, @title, @targetValue, @unit, @timeframe, @status, @notes, @createdAt, @updatedAt)
  `);
  goals.run({
    category: "weight",
    title: "Cut 4 kg while preserving training performance",
    targetValue: 68,
    unit: "kg",
    timeframe: "12 weeks",
    status: "active",
    notes: "Prefer a slow cut with sustainable calories",
    createdAt: timestamp,
    updatedAt: timestamp
  });
  goals.run({
    category: "habit",
    title: "Hit 4 strength sessions per week",
    targetValue: 4,
    unit: "sessions",
    timeframe: "weekly",
    status: "active",
    notes: "Upper/lower split",
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const items = db.prepare(`
    INSERT INTO preference_items (kind, category, label, value, notes, created_at, updated_at)
    VALUES (@kind, @category, @label, @value, @notes, @createdAt, @updatedAt)
  `);
  items.run({
    kind: "preference",
    category: "nutrition",
    label: "Breakfast style",
    value: "savory and high-protein",
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  items.run({
    kind: "constraint",
    category: "medical",
    label: "Knee impact tolerance",
    value: "avoid frequent jumping",
    notes: "Swap running intervals for bike/rower when needed",
    createdAt: timestamp,
    updatedAt: timestamp
  });

  db.prepare(`
    INSERT INTO check_ins (
      check_in_date, weight_kg, calories_avg, protein_g_avg,
      training_sessions, energy, adherence, notes, created_at
    ) VALUES (
      @checkInDate, @weightKg, @caloriesAvg, @proteinGAvg,
      @trainingSessions, @energy, @adherence, @notes, @createdAt
    )
  `).run({
    checkInDate: new Date().toISOString().slice(0, 10),
    weightKg: 72,
    caloriesAvg: 2130,
    proteinGAvg: 148,
    trainingSessions: 4,
    energy: 7,
    adherence: 8,
    notes: "Baseline weekly check-in",
    createdAt: timestamp
  });
}

export function getProfile(): Profile | null {
  const row = db.prepare("SELECT * FROM profile WHERE id = 'default'").get() as
    | Record<string, unknown>
    | undefined;
  return row ? mapProfile(row) : null;
}

export function upsertProfile(input: Omit<Profile, "id" | "updatedAt">): Profile {
  const updatedAt = nowIso();
  db.prepare(`
    INSERT INTO profile (
      id, full_name, age, sex, height_cm, weight_kg, activity_level, diet_style,
      workout_days_per_week, calorie_target, protein_target_g, equipment_access,
      injuries, allergies, notes, updated_at
    ) VALUES (
      'default', @fullName, @age, @sex, @heightCm, @weightKg, @activityLevel, @dietStyle,
      @workoutDaysPerWeek, @calorieTarget, @proteinTargetG, @equipmentAccess,
      @injuries, @allergies, @notes, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      full_name = excluded.full_name,
      age = excluded.age,
      sex = excluded.sex,
      height_cm = excluded.height_cm,
      weight_kg = excluded.weight_kg,
      activity_level = excluded.activity_level,
      diet_style = excluded.diet_style,
      workout_days_per_week = excluded.workout_days_per_week,
      calorie_target = excluded.calorie_target,
      protein_target_g = excluded.protein_target_g,
      equipment_access = excluded.equipment_access,
      injuries = excluded.injuries,
      allergies = excluded.allergies,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `).run({ ...input, updatedAt });

  return getProfile() as Profile;
}

export function listGoals(): Goal[] {
  return (db.prepare("SELECT * FROM goals ORDER BY updated_at DESC").all() as Record<string, unknown>[]).map(mapGoal);
}

export function createGoal(input: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal {
  const createdAt = nowIso();
  const result = db.prepare(`
    INSERT INTO goals (category, title, target_value, unit, timeframe, status, notes, created_at, updated_at)
    VALUES (@category, @title, @targetValue, @unit, @timeframe, @status, @notes, @createdAt, @updatedAt)
  `).run({ ...input, createdAt, updatedAt: createdAt });
  return getGoalById(Number(result.lastInsertRowid)) as Goal;
}

export function getGoalById(id: number): Goal | null {
  const row = db.prepare("SELECT * FROM goals WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapGoal(row) : null;
}

export function updateGoal(id: number, input: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal | null {
  const updatedAt = nowIso();
  const result = db.prepare(`
    UPDATE goals SET
      category = @category,
      title = @title,
      target_value = @targetValue,
      unit = @unit,
      timeframe = @timeframe,
      status = @status,
      notes = @notes,
      updated_at = @updatedAt
    WHERE id = @id
  `).run({ ...input, id, updatedAt });
  if (result.changes === 0) {
    return null;
  }
  return getGoalById(id);
}

export function deleteGoal(id: number): boolean {
  const result = db.prepare("DELETE FROM goals WHERE id = ?").run(id);
  return result.changes > 0;
}

export function listPreferenceItems(kind?: PreferenceItem["kind"]): PreferenceItem[] {
  const rows = kind
    ? (db.prepare("SELECT * FROM preference_items WHERE kind = ? ORDER BY updated_at DESC").all(kind) as Record<string, unknown>[])
    : (db.prepare("SELECT * FROM preference_items ORDER BY updated_at DESC").all() as Record<string, unknown>[]);
  return rows.map(mapPreference);
}

export function createPreferenceItem(input: Omit<PreferenceItem, "id" | "createdAt" | "updatedAt">): PreferenceItem {
  const createdAt = nowIso();
  const result = db.prepare(`
    INSERT INTO preference_items (kind, category, label, value, notes, created_at, updated_at)
    VALUES (@kind, @category, @label, @value, @notes, @createdAt, @updatedAt)
  `).run({ ...input, createdAt, updatedAt: createdAt });
  return getPreferenceItemById(Number(result.lastInsertRowid)) as PreferenceItem;
}

export function getPreferenceItemById(id: number): PreferenceItem | null {
  const row = db.prepare("SELECT * FROM preference_items WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapPreference(row) : null;
}

export function updatePreferenceItem(id: number, input: Omit<PreferenceItem, "id" | "createdAt" | "updatedAt">): PreferenceItem | null {
  const updatedAt = nowIso();
  const result = db.prepare(`
    UPDATE preference_items SET
      kind = @kind,
      category = @category,
      label = @label,
      value = @value,
      notes = @notes,
      updated_at = @updatedAt
    WHERE id = @id
  `).run({ ...input, id, updatedAt });
  if (result.changes === 0) {
    return null;
  }
  return getPreferenceItemById(id);
}

export function deletePreferenceItem(id: number): boolean {
  const result = db.prepare("DELETE FROM preference_items WHERE id = ?").run(id);
  return result.changes > 0;
}

export function listCheckIns(): CheckIn[] {
  return (db.prepare("SELECT * FROM check_ins ORDER BY check_in_date DESC, id DESC").all() as Record<string, unknown>[]).map(mapCheckIn);
}

export function createCheckIn(input: Omit<CheckIn, "id" | "createdAt">): CheckIn {
  const createdAt = nowIso();
  const result = db.prepare(`
    INSERT INTO check_ins (
      check_in_date, weight_kg, calories_avg, protein_g_avg,
      training_sessions, energy, adherence, notes, created_at
    ) VALUES (
      @checkInDate, @weightKg, @caloriesAvg, @proteinGAvg,
      @trainingSessions, @energy, @adherence, @notes, @createdAt
    )
  `).run({ ...input, createdAt });
  return getCheckInById(Number(result.lastInsertRowid)) as CheckIn;
}

export function getCheckInById(id: number): CheckIn | null {
  const row = db.prepare("SELECT * FROM check_ins WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapCheckIn(row) : null;
}

export function updateCheckIn(id: number, input: Omit<CheckIn, "id" | "createdAt">): CheckIn | null {
  const result = db.prepare(`
    UPDATE check_ins SET
      check_in_date = @checkInDate,
      weight_kg = @weightKg,
      calories_avg = @caloriesAvg,
      protein_g_avg = @proteinGAvg,
      training_sessions = @trainingSessions,
      energy = @energy,
      adherence = @adherence,
      notes = @notes
    WHERE id = @id
  `).run({ ...input, id });
  if (result.changes === 0) {
    return null;
  }
  return getCheckInById(id);
}

export function deleteCheckIn(id: number): boolean {
  const result = db.prepare("DELETE FROM check_ins WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getDashboardSummary() {
  const profile = getProfile();
  const goals = listGoals();
  const preferences = listPreferenceItems("preference");
  const constraints = listPreferenceItems("constraint");
  const checkIns = listCheckIns();
  const latestCheckIn = checkIns[0] ?? null;
  const previousCheckIn = checkIns[1] ?? null;
  const weightDelta =
    latestCheckIn?.weightKg != null && previousCheckIn?.weightKg != null
      ? Number((latestCheckIn.weightKg - previousCheckIn.weightKg).toFixed(1))
      : null;

  return {
    profile,
    metrics: {
      activeGoalCount: goals.filter((goal) => goal.status === "active").length,
      preferenceCount: preferences.length,
      constraintCount: constraints.length,
      totalCheckIns: checkIns.length,
      latestWeightKg: latestCheckIn?.weightKg ?? null,
      weightDeltaKg: weightDelta,
      latestEnergy: latestCheckIn?.energy ?? null,
      latestAdherence: latestCheckIn?.adherence ?? null
    },
    recentCheckIn: latestCheckIn,
    activeGoals: goals.filter((goal) => goal.status === "active").slice(0, 5),
    preferences: preferences.slice(0, 5),
    constraints: constraints.slice(0, 5)
  };
}

export function exportAllData() {
  return {
    profile: getProfile(),
    goals: listGoals(),
    preferenceItems: listPreferenceItems(),
    checkIns: listCheckIns()
  };
}

export { DB_PATH, DATA_DIR, db };
