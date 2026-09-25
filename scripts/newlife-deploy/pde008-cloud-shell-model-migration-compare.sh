#!/usr/bin/env bash
set -euo pipefail

# PDE-008 — one-shot Cloud Shell model migration comparison.
# Production is read-only from this script: no deploy, no API enablement,
# no endpoint/model/env mutation. Vertex calls do incur normal model usage.

PROJECT_ID="${PROJECT_ID:-gas-test-runner-20260620-wjxf}"
REPO="${REPO:-https://github.com/fukuoka1980521-beep/thinking-game.git}"
BRANCH="${BRANCH:-chatgpt/newlife-refoundation-v1}"
RUNS="${RUNS:-2}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/newlife-model-migration.XXXXXX")"
OUT_ROOT="$WORKDIR/evidence"
FINAL_DIR="$HOME/NEW_LIFE_MODEL_MIGRATION_$STAMP"
FINAL_ZIP="$HOME/NEW_LIFE_MODEL_MIGRATION_BLIND_$STAMP.zip"
RAW_ZIP="$HOME/NEW_LIFE_MODEL_MIGRATION_RAW_$STAMP.zip"

echo "NEW LIFE Gemini migration comparison"
echo "Project: $PROJECT_ID"
echo "Branch:  $BRANCH"
echo "Mode: COMPARE ONLY — no deploy, no API enable, no production change"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "BLOCKED: gcloud is not available in this Cloud Shell."
  exit 10
fi
if ! command -v git >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "BLOCKED: git/node/npm is missing."
  exit 11
fi
if ! command -v zip >/dev/null 2>&1; then
  echo "BLOCKED: zip is missing."
  exit 12
fi

ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1)"
if [ -z "$ACCOUNT" ]; then
  echo "BLOCKED: no active Google account in Cloud Shell."
  exit 13
fi
echo "Google account: $ACCOUNT"

BILLING="$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingEnabled)' 2>/dev/null || true)"
if [ "$BILLING" != "True" ] && [ "$BILLING" != "true" ]; then
  echo "BLOCKED: billing is not confirmed enabled for $PROJECT_ID."
  exit 14
fi

if ! gcloud services list --enabled --project "$PROJECT_ID" --format='value(config.name)' | grep -qx 'aiplatform.googleapis.com'; then
  echo "BLOCKED: aiplatform.googleapis.com is not enabled. This script will NOT enable it."
  exit 15
fi

if ! gcloud auth application-default print-access-token >/dev/null 2>&1; then
  echo "Application Default Credentials are not active."
  echo "Starting Google's standard interactive ADC authorization..."
  gcloud auth application-default login
fi

git clone --quiet --filter=blob:none "$REPO" "$WORKDIR/repo"
cd "$WORKDIR/repo"
git fetch --quiet origin "$BRANCH"
git checkout --quiet --detach "origin/$BRANCH"

echo "Installing the two isolated function dependency sets used by the harnesses..."
npm install --silent --omit=dev --no-audit --no-fund --package-lock=false --prefix functions/newlife-dialogue
npm install --silent --omit=dev --no-audit --no-fund --package-lock=false --prefix functions/newlife-refoundation-ai

mkdir -p "$OUT_ROOT/location" "$OUT_ROOT/legacy-global" "$OUT_ROOT/refoundation-global"

echo
echo "LANE A — location/consumption compatibility probe"
node scripts/newlife-model-migration/probe-model-location-availability.cjs \
  --project "$PROJECT_ID" \
  --locations asia-northeast1,global \
  --models gemini-2.5-flash,gemini-3.5-flash,gemini-3.5-flash-lite \
  --out "$OUT_ROOT/location/model-location-availability.json"

echo
echo "LANE B1 — legacy common-location quality comparison"
node scripts/newlife-model-migration/compare-legacy-models.mjs \
  --project "$PROJECT_ID" \
  --location global \
  --models gemini-2.5-flash,gemini-3.5-flash,gemini-3.5-flash-lite \
  --runs "$RUNS" \
  --out "$OUT_ROOT/legacy-global"

echo
echo "LANE B2 — refoundation common-location quality comparison"
node scripts/newlife-model-migration/compare-refoundation-models.cjs \
  --project "$PROJECT_ID" \
  --location global \
  --models gemini-2.5-flash,gemini-3.5-flash,gemini-3.5-flash-lite \
  --runs "$RUNS" \
  --out "$OUT_ROOT/refoundation-global"

mkdir -p "$FINAL_DIR/blind" "$FINAL_DIR/unblind"
cp "$OUT_ROOT/location/model-location-availability.json" "$FINAL_DIR/unblind/"
find "$OUT_ROOT/legacy-global" "$OUT_ROOT/refoundation-global" -type f -name 'blind-results-*.json' -exec cp {} "$FINAL_DIR/blind/" \;
find "$OUT_ROOT/legacy-global" "$OUT_ROOT/refoundation-global" -type f \( -name 'raw-results-*.json' -o -name 'blind-map-*.json' \) -exec cp {} "$FINAL_DIR/unblind/" \;
cp docs/newlife/migration/EVALUATION_RUBRIC_V1.md "$FINAL_DIR/blind/"
cp docs/newlife/migration/MODEL_LOCATION_COMPATIBILITY_V1.md "$FINAL_DIR/unblind/"

python3 - "$FINAL_DIR" <<'PY'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1])
blind = list((root / "blind").glob("blind-results-*.json"))
manifest = {
    "audit": "NEW_LIFE_MODEL_MIGRATION_CLOUD_SHELL_V1",
    "blind_files": sorted(p.name for p in blind),
    "instruction": "Share BLIND bundle first. Keep RAW bundle withheld until blind scoring is frozen.",
    "production_changed": False,
}
(root / "blind" / "MANIFEST.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
)
PY

(
  cd "$FINAL_DIR/blind"
  zip -q -r "$FINAL_ZIP" .
)
(
  cd "$FINAL_DIR/unblind"
  zip -q -r "$RAW_ZIP" .
)

echo
echo "PDE008_COMPARE=PASS"
echo "PRODUCTION_CHANGED=NO"
echo "BLIND_BUNDLE=$FINAL_ZIP"
echo "RAW_BUNDLE=$RAW_ZIP"
echo "NEXT_BOUNDARY=Share BLIND_BUNDLE for blind evaluation; keep RAW_BUNDLE withheld until scoring is frozen."
