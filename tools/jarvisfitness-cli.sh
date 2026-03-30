#!/usr/bin/env bash
# JarvisFitness CLI - minimal agent-facing tool for reading/writing fitness data
# Usage: ./jarvisfitness-cli.sh <command> [args]
# Designed for use by OpenClaw agents or similar automation.
set -euo pipefail

BASE_URL="${JARVISFITNESS_API_URL:-http://localhost:5100/api}"

usage() {
  cat <<EOF
JarvisFitness CLI — agent-facing tool

Commands:
  health                              Health check
  profile                             Get profile
  set-profile <json>                  Upsert profile

  goals                               List goals
  create-goal <json>                  Create goal
  update-goal <id> <json>             Update goal
  delete-goal <id>                    Delete goal

  preferences [Preference|Constraint] List preferences / constraints
  create-preference <json>            Create preference item
  update-preference <id> <json>       Update preference item
  delete-preference <id>              Delete preference item

  check-ins                           List check-ins
  create-check-in <json>              Create check-in
  update-check-in <id> <json>         Update check-in
  delete-check-in <id>                Delete check-in

  dashboard                           Dashboard summary
  export                              Full export
  search <query>                      Search across profile, goals, notes

Environment:
  JARVISFITNESS_API_URL  Base API URL (default: http://localhost:5100/api)
EOF
}

urlencode() {
  python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"
}

case "${1:-}" in
  health)
    curl -s "$BASE_URL/health" ;;
  profile)
    curl -s "$BASE_URL/profile" ;;
  set-profile)
    curl -s -X PUT "$BASE_URL/profile" -H "Content-Type: application/json" -d "$2" ;;
  goals)
    curl -s "$BASE_URL/goals" ;;
  create-goal)
    curl -s -X POST "$BASE_URL/goals" -H "Content-Type: application/json" -d "$2" ;;
  update-goal)
    curl -s -X PUT "$BASE_URL/goals/$2" -H "Content-Type: application/json" -d "$3" ;;
  delete-goal)
    curl -s -X DELETE "$BASE_URL/goals/$2" -w "\n%{http_code}\n" ;;
  preferences)
    if [ -n "${2:-}" ]; then
      curl -s "$BASE_URL/preferences?kind=$2"
    else
      curl -s "$BASE_URL/preferences"
    fi ;;
  create-preference)
    curl -s -X POST "$BASE_URL/preferences" -H "Content-Type: application/json" -d "$2" ;;
  update-preference)
    curl -s -X PUT "$BASE_URL/preferences/$2" -H "Content-Type: application/json" -d "$3" ;;
  delete-preference)
    curl -s -X DELETE "$BASE_URL/preferences/$2" -w "\n%{http_code}\n" ;;
  check-ins)
    curl -s "$BASE_URL/check-ins" ;;
  create-check-in)
    curl -s -X POST "$BASE_URL/check-ins" -H "Content-Type: application/json" -d "$2" ;;
  update-check-in)
    curl -s -X PUT "$BASE_URL/check-ins/$2" -H "Content-Type: application/json" -d "$3" ;;
  delete-check-in)
    curl -s -X DELETE "$BASE_URL/check-ins/$2" -w "\n%{http_code}\n" ;;
  dashboard)
    curl -s "$BASE_URL/dashboard/summary" ;;
  export)
    curl -s "$BASE_URL/export" ;;
  search)
    curl -s "$BASE_URL/search?q=$(urlencode "$2")" ;;
  *)
    usage ;;
esac
