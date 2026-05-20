#!/usr/bin/env bash
# Pre-launch placeholder / regression scanner.
# Exits non-zero if any forbidden string is found, so CI can block deploys.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAIL=0

scan() {
  local label="$1"
  local pattern="$2"
  local files
  files=$(git ls-files \
    | grep -E '\.(tsx?|jsx?|md|mdx|json|html|css)$' \
    | grep -v '^docs/superpowers/' \
    | grep -v '^USER_DATA_REQUIRED.md$' \
    | grep -v '^IMPLEMENTATION_REPORT.md$' \
    | grep -v '^scripts/prelaunch-scan.sh$' \
    | grep -v '^CLAUDE.md$' \
    || true)
  if [ -z "$files" ]; then
    echo "i  $label - no files to scan"
    return
  fi
  if echo "$files" | xargs grep -nE "$pattern" 2>/dev/null; then
    echo "FAIL $label"
    FAIL=1
  else
    echo "OK   $label"
  fi
}

echo "=== Pre-launch scan ==="
scan "Placeholder strings"     'PLACEHOLDER|123 Boulevard|5XX-XXXXXX|212XXX|XXX000000|lorem ipsum|Photo à venir'
scan "Logo typo"               'logo_tomobil360'
scan "Bank of Africa artifact" 'bank_of_africa'
scan "Bare social links"       '"https://(facebook|youtube|instagram|tiktok)\.com"'
scan "Non-partner refs"        'wandaloo|netcarshow|automobile\.tn|kifal|moteur\.ma|avito|carmudi'
scan "Personal Gmail in pages" 'rafiklahlou@gmail|davidolivierjeremie@gmail|aminebouharaoui@gmail|nabnabilbennani@gmail'

if [ $FAIL -ne 0 ]; then
  echo ""
  echo "Scan FAILED - fix the items above before deploying."
  exit 1
fi
echo ""
echo "All scans passed."
