import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { ZodError } from "zod";

import {
  DATA_DIR,
  DB_PATH,
  createCheckIn,
  createGoal,
  createPreferenceItem,
  deleteCheckIn,
  deleteGoal,
  deletePreferenceItem,
  exportAllData,
  getDashboardSummary,
  getProfile,
  listCheckIns,
  listGoals,
  listPreferenceItems,
  seedIfEmpty,
  updateCheckIn,
  updateGoal,
  updatePreferenceItem,
  upsertProfile
} from "./db";
import {
  checkInSchema,
  goalSchema,
  preferenceSchema,
  profileSchema,
  queryKindSchema
} from "./validation";

seedIfEmpty();

const app = express();
const port = Number(process.env.PORT ?? 4000);

function withNullDefaults<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value === undefined ? null : value])
  ) as T;
}

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    databasePath: DB_PATH,
    dataDir: DATA_DIR
  });
});

app.get("/api/profile", (_req, res) => {
  res.json({ profile: getProfile() });
});

app.put("/api/profile", (req, res) => {
  const payload = withNullDefaults(profileSchema.parse(req.body));
  const profile = upsertProfile(payload);
  res.json({ profile });
});

app.get("/api/goals", (_req, res) => {
  res.json({ goals: listGoals() });
});

app.post("/api/goals", (req, res) => {
  const goal = createGoal(withNullDefaults(goalSchema.parse(req.body)));
  res.status(201).json({ goal });
});

app.put("/api/goals/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Goal id must be a number." });
  }
  const goal = updateGoal(id, withNullDefaults(goalSchema.parse(req.body)));
  if (!goal) {
    return res.status(404).json({ error: "Goal not found." });
  }
  return res.json({ goal });
});

app.delete("/api/goals/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Goal id must be a number." });
  }
  if (!deleteGoal(id)) {
    return res.status(404).json({ error: "Goal not found." });
  }
  return res.status(204).send();
});

app.get("/api/preferences", (req, res) => {
  const kind = queryKindSchema.parse(req.query.kind);
  res.json({ items: listPreferenceItems(kind) });
});

app.post("/api/preferences", (req, res) => {
  const item = createPreferenceItem(withNullDefaults(preferenceSchema.parse(req.body)));
  res.status(201).json({ item });
});

app.put("/api/preferences/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Preference item id must be a number." });
  }
  const item = updatePreferenceItem(id, withNullDefaults(preferenceSchema.parse(req.body)));
  if (!item) {
    return res.status(404).json({ error: "Preference item not found." });
  }
  return res.json({ item });
});

app.delete("/api/preferences/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Preference item id must be a number." });
  }
  if (!deletePreferenceItem(id)) {
    return res.status(404).json({ error: "Preference item not found." });
  }
  return res.status(204).send();
});

app.get("/api/check-ins", (_req, res) => {
  res.json({ checkIns: listCheckIns() });
});

app.post("/api/check-ins", (req, res) => {
  const checkIn = createCheckIn(withNullDefaults(checkInSchema.parse(req.body)));
  res.status(201).json({ checkIn });
});

app.put("/api/check-ins/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Check-in id must be a number." });
  }
  const checkIn = updateCheckIn(id, withNullDefaults(checkInSchema.parse(req.body)));
  if (!checkIn) {
    return res.status(404).json({ error: "Check-in not found." });
  }
  return res.json({ checkIn });
});

app.delete("/api/check-ins/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Check-in id must be a number." });
  }
  if (!deleteCheckIn(id)) {
    return res.status(404).json({ error: "Check-in not found." });
  }
  return res.status(204).send();
});

app.get("/api/dashboard/summary", (_req, res) => {
  res.json(getDashboardSummary());
});

app.get("/api/export", (_req, res) => {
  res.json(exportAllData());
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Route not found." });
  }
  return res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed.",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error." });
});

app.listen(port, () => {
  console.log(`JarvisFitness listening on http://localhost:${port}`);
});
