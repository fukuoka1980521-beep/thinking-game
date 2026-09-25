#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gas-test-runner-20260620-wjxf}"
REGION="${REGION:-asia-northeast1}"
FUNCTION_NAME="newlife-refoundation-ai"
BRANCH="chatgpt/newlife-refoundation-v1"
REPO_URL="https://github.com/fukuoka1980521-beep/thinking-game.git"

echo "PDE-007: one-time Cloud Shell live probe"
echo "Project: ${PROJECT_ID}"
echo "Branch:  ${BRANCH}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "ERROR: gcloud is unavailable. Run this only in Google Cloud Shell." >&2
  exit 1
fi

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1 || true)"
if [ -z "${ACTIVE_ACCOUNT}" ]; then
  echo "ERROR: no active Google account in Cloud Shell. Authorize Cloud Shell, then run again." >&2
  exit 1
fi
echo "Active Google account detected."

BILLING="$(gcloud billing projects describe "${PROJECT_ID}" --format='value(billingEnabled)' 2>/dev/null || true)"
if [ "${BILLING}" != "True" ]; then
  echo "ERROR: billing is not enabled/visible for ${PROJECT_ID}." >&2
  exit 1
fi
echo "Billing OK."

echo "Ensuring required APIs are enabled..."
gcloud services enable   aiplatform.googleapis.com   cloudfunctions.googleapis.com   cloudbuild.googleapis.com   run.googleapis.com   artifactregistry.googleapis.com   --project="${PROJECT_ID}"   --quiet

WORKDIR="$(mktemp -d)"
trap 'rm -rf "${WORKDIR}"' EXIT

echo "Fetching isolated refoundation backend..."
git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${WORKDIR}/repo" >/dev/null 2>&1

echo "Deploying one-time live validation backend..."
gcloud functions deploy "${FUNCTION_NAME}"   --gen2   --runtime=nodejs20   --region="${REGION}"   --source="${WORKDIR}/repo/functions/newlife-refoundation-ai"   --entry-point=newlifeRefoundationAi   --trigger-http   --allow-unauthenticated   --memory=256Mi   --timeout=20s   --max-instances=1   --project="${PROJECT_ID}"   --set-env-vars=GCP_PROJECT="${PROJECT_ID}"   --quiet

URI="$(gcloud functions describe "${FUNCTION_NAME}"   --gen2   --region="${REGION}"   --project="${PROJECT_ID}"   --format='value(serviceConfig.uri)')"

if [ -z "${URI}" ]; then
  echo "ERROR: deployment completed without a service URI." >&2
  exit 1
fi

echo "Running live smoke: interpret_turn..."
INTERPRET_BODY='{"operation":"interpret_turn","utterance":"何がひっかかっている？","caseContext":"PDE-007 live validation fixture. Theater rehearsal has stopped because Mika says a scene uses her real personal story too directly. Ryo is worried that changing it now will disrupt tomorrow'''s sold performance. The player is trying to understand Mika'''s concern before deciding what to change."}'
INTERPRET_RESP="$(curl -fsS --max-time 35 -X POST "${URI}" -H 'Content-Type: application/json' -d "${INTERPRET_BODY}")"
node -e '
  const p = JSON.parse(process.argv[1]);
  if (!p || typeof p !== "object") throw new Error("interpret_turn response is not an object");
  if (typeof p.action !== "string") throw new Error("missing action");
  if (typeof p.boundaryMode !== "string") throw new Error("missing boundaryMode");
  if (!Array.isArray(p.relationalEvents)) throw new Error("missing relationalEvents");
  if (typeof p.needsClarification !== "boolean") throw new Error("missing needsClarification");
' "${INTERPRET_RESP}"

echo "Running live smoke: generate_npc_line..."
NPC_BODY='{"operation":"generate_npc_line","projection":{"npc":"MIKA","relationshipState":"NEUTRAL","boundaryStatus":"UNKNOWN","lastPlayerTurn":"何がひっかかっている？","sceneContext":"PDE-007 live validation fixture. Theater rehearsal has stopped because Mika says a scene uses her real personal story too directly. The player has just asked what is bothering her."}}'
NPC_RESP="$(curl -fsS --max-time 35 -X POST "${URI}" -H 'Content-Type: application/json' -d "${NPC_BODY}")"
node -e '
  const p = JSON.parse(process.argv[1]);
  if (!p || typeof p !== "object") throw new Error("generate_npc_line response is not an object");
  if (p.npc !== "MIKA") throw new Error("wrong npc");
  if (typeof p.text !== "string" || !p.text.trim()) throw new Error("missing NPC text");
' "${NPC_RESP}"

echo
echo "PDE007_SMOKE=PASS"
echo "PDE007_ENDPOINT=${URI}"
echo "Paste only the PDE007_ENDPOINT=... line back into ChatGPT."
