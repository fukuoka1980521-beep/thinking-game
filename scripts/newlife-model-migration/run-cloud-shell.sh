#!/usr/bin/env bash
set -euo pipefail

# NEW LIFE Gemini migration comparison — Cloud Shell helper.
# This script DOES NOT deploy, enable/disable APIs, change billing/IAM,
# update Cloud Run/Functions, or edit the product endpoint/model setting.
# It only installs the already-declared local function dependencies and
# performs direct Vertex AI comparison calls.

PROJECT_ID="${PROJECT_ID:-gas-test-runner-20260620-wjxf}"
LOCATION="${LOCATION:-asia-northeast1}"
RUNS="${RUNS:-1}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "ERROR: gcloud is unavailable. Use Google Cloud Shell or another already-authenticated environment." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: node/npm are unavailable." >&2
  exit 1
fi

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1 || true)"
if [ -z "$ACTIVE_ACCOUNT" ]; then
  echo "ERROR: no active Google Cloud account. This helper will not initiate or alter authentication." >&2
  exit 1
fi

PROJECT_CHECK="$(gcloud projects describe "$PROJECT_ID" --format='value(projectId)' 2>/dev/null || true)"
if [ "$PROJECT_CHECK" != "$PROJECT_ID" ]; then
  echo "ERROR: project '$PROJECT_ID' is not readable by the active account." >&2
  exit 1
fi

AIPLATFORM_ENABLED="$(gcloud services list --enabled --project "$PROJECT_ID" --filter='config.name=aiplatform.googleapis.com' --format='value(config.name)' 2>/dev/null || true)"
if [ "$AIPLATFORM_ENABLED" != "aiplatform.googleapis.com" ]; then
  echo "ERROR: aiplatform.googleapis.com is not enabled. This helper will NOT enable it." >&2
  exit 1
fi

echo "NEW LIFE model migration comparison"
echo "Project: $PROJECT_ID"
echo "Region:  $LOCATION"
echo "Runs:    $RUNS"
echo "No cloud configuration will be changed."

npm ci --omit=dev --prefix functions/newlife-dialogue

export GCP_PROJECT="$PROJECT_ID"
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"

node scripts/newlife-model-migration/compare-legacy-models.cjs   --project "$PROJECT_ID"   --location "$LOCATION"   --runs "$RUNS"
