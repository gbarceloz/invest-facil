#!/usr/bin/env bash
# Structural integrity gate for the Invest Facil repository.
# Runs on GitHub Actions ubuntu-latest (bash + node). No secrets, no external services.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

required=(
  ".github/workflows/ci.yml"
  "backend/pom.xml"
  "frontend/package.json"
  "frontend/package-lock.json"
  "video/package.json"
  "scripts/ci/assert-surefire.py"
)
for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "INTEGRITY FAIL: missing required file: $file" >&2
    exit 1
  fi
done

# Validate JSON files with Node's built-in parser.
node -e '
const fs = require("fs");
for (const file of process.argv.slice(1)) {
  JSON.parse(fs.readFileSync(file, "utf8"));
  console.log("JSON OK:", file);
}
' frontend/package.json frontend/package-lock.json video/package.json

WORKFLOW=".github/workflows/ci.yml"

# Fail if the workflow silences failures or skips changes via path filters.
if grep -nE 'continue-on-error:[[:space:]]*true|\|\|[[:space:]]*true|paths(-ignore)?:' "$WORKFLOW"; then
  echo "INTEGRITY FAIL: failure-silencing or path-filter pattern found in $WORKFLOW" >&2
  exit 1
fi

# Required triggers and least-privilege policy.
grep -q 'pull_request:' "$WORKFLOW" || { echo "INTEGRITY FAIL: pull_request trigger missing" >&2; exit 1; }
grep -q 'workflow_dispatch:' "$WORKFLOW" || { echo "INTEGRITY FAIL: workflow_dispatch missing" >&2; exit 1; }
grep -q 'permissions:' "$WORKFLOW" || { echo "INTEGRITY FAIL: permissions block missing" >&2; exit 1; }
grep -q 'contents: read' "$WORKFLOW" || { echo "INTEGRITY FAIL: contents: read missing" >&2; exit 1; }
grep -q 'npm ci' "$WORKFLOW" || { echo "INTEGRITY FAIL: npm ci missing" >&2; exit 1; }
grep -q 'mvn -B clean verify' "$WORKFLOW" || { echo "INTEGRITY FAIL: mvn clean verify missing" >&2; exit 1; }
grep -q 'npm run typecheck' "$WORKFLOW" || { echo "INTEGRITY FAIL: typecheck missing" >&2; exit 1; }
grep -q 'npm audit --omit=dev' "$WORKFLOW" || { echo "INTEGRITY FAIL: production audit missing" >&2; exit 1; }

if grep -nE 'contents:[[:space:]]*write|pull-requests:[[:space:]]*write|permissions:[[:space:]]*write-all|pull_request_target' "$WORKFLOW"; then
  echo "INTEGRITY FAIL: write/admin permission or pull_request_target found" >&2
  exit 1
fi

# Avoid accidental secret dependency in this CI.
if grep -nE 'secrets\.|GITHUB_TOKEN.*write' "$WORKFLOW"; then
  echo "INTEGRITY FAIL: workflow references secrets or write token" >&2
  exit 1
fi

echo "INTEGRITY GATE: PASS"
