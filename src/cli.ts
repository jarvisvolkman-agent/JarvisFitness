#!/usr/bin/env node
/**
 * Minimal agent-facing CLI / tool wrapper for JarvisFitness.
 * Talks to the local Express API so an LLM agent (or human) can
 * read and write fitness data from the command line.
 *
 * Usage:
 *   npx tsx src/cli.ts <command> [json-body]
 *
 * Commands:
 *   health                        - API health check
 *   profile                       - Get current profile
 *   profile:set <json>            - Update profile
 *   goals                         - List goals
 *   goals:create <json>           - Create a goal
 *   goals:update <id> <json>      - Update a goal
 *   goals:delete <id>             - Delete a goal
 *   preferences [kind]            - List preferences/constraints
 *   preferences:create <json>     - Create preference item
 *   preferences:update <id> <json>- Update preference item
 *   preferences:delete <id>       - Delete preference item
 *   checkins                      - List check-ins
 *   checkins:create <json>        - Create check-in
 *   checkins:update <id> <json>   - Update check-in
 *   checkins:delete <id>          - Delete check-in
 *   dashboard                     - Dashboard summary
 *   export                        - Export all data
 */

const BASE = process.env.API_URL ?? "http://localhost:4000";

async function request(method: string, path: string, body?: unknown) {
  const url = `${BASE}${path}`;
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (res.status === 204) {
    console.log("OK (deleted)");
    return;
  }
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  if (!res.ok) {
    process.exit(1);
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    console.error("Invalid JSON argument:", raw);
    process.exit(1);
  }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (!command) {
    console.error("Usage: jarvis-fitness <command> [args]");
    console.error("Commands: health profile profile:set goals goals:create goals:update goals:delete");
    console.error("          preferences preferences:create preferences:update preferences:delete");
    console.error("          checkins checkins:create checkins:update checkins:delete dashboard export");
    process.exit(1);
  }

  switch (command) {
    case "health":
      return request("GET", "/api/health");
    case "profile":
      return request("GET", "/api/profile");
    case "profile:set":
      return request("PUT", "/api/profile", parseJson(rest[0]));
    case "goals":
      return request("GET", "/api/goals");
    case "goals:create":
      return request("POST", "/api/goals", parseJson(rest[0]));
    case "goals:update":
      return request("PUT", `/api/goals/${rest[0]}`, parseJson(rest[1]));
    case "goals:delete":
      return request("DELETE", `/api/goals/${rest[0]}`);
    case "preferences":
      return request("GET", `/api/preferences${rest[0] ? `?kind=${rest[0]}` : ""}`);
    case "preferences:create":
      return request("POST", "/api/preferences", parseJson(rest[0]));
    case "preferences:update":
      return request("PUT", `/api/preferences/${rest[0]}`, parseJson(rest[1]));
    case "preferences:delete":
      return request("DELETE", `/api/preferences/${rest[0]}`);
    case "checkins":
      return request("GET", "/api/check-ins");
    case "checkins:create":
      return request("POST", "/api/check-ins", parseJson(rest[0]));
    case "checkins:update":
      return request("PUT", `/api/check-ins/${rest[0]}`, parseJson(rest[1]));
    case "checkins:delete":
      return request("DELETE", `/api/check-ins/${rest[0]}`);
    case "dashboard":
      return request("GET", "/api/dashboard/summary");
    case "export":
      return request("GET", "/api/export");
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
