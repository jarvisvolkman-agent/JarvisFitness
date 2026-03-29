import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

const BASE = "http://localhost:4000";

function req(method: string, path: string, body?: unknown): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts: http.RequestOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { "Content-Type": "application/json" },
    };
    const r = http.request(opts, (res) => {
      let buf = "";
      res.on("data", (chunk) => (buf += chunk));
      res.on("end", () => {
        const data = buf.length > 0 ? JSON.parse(buf) : null;
        resolve({ status: res.statusCode!, data });
      });
    });
    r.on("error", reject);
    if (body !== undefined) r.write(JSON.stringify(body));
    r.end();
  });
}

describe("JarvisFitness API", () => {
  it("GET /api/health returns ok", async () => {
    const { status, data } = await req("GET", "/api/health");
    assert.equal(status, 200);
    assert.equal((data as Record<string, unknown>).status, "ok");
  });

  it("GET /api/profile returns seeded profile", async () => {
    const { status, data } = await req("GET", "/api/profile");
    assert.equal(status, 200);
    const profile = (data as Record<string, unknown>).profile as Record<string, unknown>;
    assert.ok(profile);
    assert.equal(profile.fullName, "Demo Athlete");
  });

  it("PUT /api/profile updates profile", async () => {
    const { status, data } = await req("PUT", "/api/profile", {
      fullName: "Test User",
      activityLevel: "very_active",
    });
    assert.equal(status, 200);
    const profile = (data as Record<string, unknown>).profile as Record<string, unknown>;
    assert.equal(profile.fullName, "Test User");

    // restore
    await req("PUT", "/api/profile", {
      fullName: "Demo Athlete",
      activityLevel: "moderately_active",
      age: 34,
      sex: "female",
      heightCm: 168,
      weightKg: 72,
    });
  });

  it("POST /api/goals creates a goal", async () => {
    const { status, data } = await req("POST", "/api/goals", {
      category: "performance",
      title: "Bench press 80 kg",
      targetValue: 80,
      unit: "kg",
      timeframe: "6 months",
      status: "active",
    });
    assert.equal(status, 201);
    const goal = (data as Record<string, unknown>).goal as Record<string, unknown>;
    assert.equal(goal.title, "Bench press 80 kg");
  });

  it("GET /api/goals lists goals", async () => {
    const { status, data } = await req("GET", "/api/goals");
    assert.equal(status, 200);
    const goals = (data as Record<string, unknown>).goals as unknown[];
    assert.ok(goals.length >= 1);
  });

  it("POST /api/check-ins creates a check-in", async () => {
    const { status, data } = await req("POST", "/api/check-ins", {
      checkInDate: "2026-03-29",
      weightKg: 71.5,
      energy: 8,
      adherence: 9,
    });
    assert.equal(status, 201);
    const checkIn = (data as Record<string, unknown>).checkIn as Record<string, unknown>;
    assert.equal(checkIn.weightKg, 71.5);
  });

  it("GET /api/dashboard/summary returns summary", async () => {
    const { status, data } = await req("GET", "/api/dashboard/summary");
    assert.equal(status, 200);
    const d = data as Record<string, unknown>;
    assert.ok(d.profile);
    assert.ok(d.metrics);
    assert.ok(d.activeGoals);
  });

  it("GET /api/export returns all data", async () => {
    const { status, data } = await req("GET", "/api/export");
    assert.equal(status, 200);
    const d = data as Record<string, unknown>;
    assert.ok(d.profile);
    assert.ok(d.goals);
    assert.ok(d.checkIns);
  });

  it("POST /api/preferences creates a preference", async () => {
    const { status, data } = await req("POST", "/api/preferences", {
      kind: "preference",
      category: "training",
      label: "Rest period",
      value: "90-120 seconds",
    });
    assert.equal(status, 201);
    const item = (data as Record<string, unknown>).item as Record<string, unknown>;
    assert.equal(item.label, "Rest period");
  });

  it("validates bad input", async () => {
    const { status } = await req("POST", "/api/goals", { title: "" });
    assert.equal(status, 400);
  });

  it("returns 404 for unknown API routes", async () => {
    const { status } = await req("GET", "/api/nonexistent");
    assert.equal(status, 404);
  });
});
