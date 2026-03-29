#!/usr/bin/env bash
# Agent-facing shell wrapper for the JarvisFitness CLI.
# Usage: ./tools/jarvisfitness-cli.sh <command> [args...]
# Override server URL with JARVISFITNESS_API_URL or API_URL.
set -euo pipefail

export API_URL="${JARVISFITNESS_API_URL:-${API_URL:-http://localhost:4000}}"

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if command -v npx &>/dev/null; then
  exec npx tsx "$SCRIPT_DIR/src/cli.ts" "$@"
elif [ -f "$SCRIPT_DIR/dist/cli.js" ]; then
  exec node "$SCRIPT_DIR/dist/cli.js" "$@"
else
  echo "Error: npx not found and dist/cli.js not built. Run 'npm run build' first." >&2
  exit 1
fi
