#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gas-test-runner-20260620-wjxf}"
REGION="${REGION:-asia-northeast1}"
FUNCTION_NAME="newlife-refoundation-ai"
BRANCH="chatgpt/newlife-refoundation-v1"
REPO_URL="https://github.com/fukuoka1980521-beep/thinking-game.git"
TEST_BASE_URL="https://fukuoka1980521-beep.github.io/thinking-game/newlife-pde009.html"

echo "NEW LIFE PDE-009 live human-test bootstrap"
echo "Project: ${PROJECT_ID}"
echo "Region:  ${REGION}"
echo "Mode: isolated backend deploy + smoke + human-test URL"

for cmd in gcloud git curl node; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "BLOCKED: $cmd is unavailable. Run this in Google Cloud Shell." >&2
    exit 10
  fi
done

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1 || true)"
if [ -z "${ACTIVE_ACCOUNT}" ]; then
  echo "BLOCKED: no active Google account in Cloud Shell." >&2
  exit 11
fi

BILLING="$(gcloud billing projects describe "${PROJECT_ID}" --format='value(billingEnabled)' 2>/dev/null || true)"
if [ "${BILLING}" != "True" ] && [ "${BILLING}" != "true" ]; then
  echo "BLOCKED: billing is not enabled/visible for ${PROJECT_ID}." >&2
  exit 12
fi

REQUIRED_APIS=(
  aiplatform.googleapis.com
  cloudfunctions.googleapis.com
  cloudbuild.googleapis.com
  run.googleapis.com
  artifactregistry.googleapis.com
)
ENABLED="$(gcloud services list --enabled --project "${PROJECT_ID}" --format='value(config.name)')"
for api in "${REQUIRED_APIS[@]}"; do
  if ! grep -qx "${api}" <<<"${ENABLED}"; then
    echo "BLOCKED: required API is disabled: ${api}" >&2
    echo "This script will not enable APIs automatically." >&2
    exit 13
  fi
done

WORKDIR="$(mktemp -d)"
trap 'rm -rf "${WORKDIR}"' EXIT

echo "Fetching isolated refoundation backend..."
git clone --quiet --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${WORKDIR}/repo"

echo "Deploying isolated backend (production NEW LIFE is untouched)..."
gcloud functions deploy "${FUNCTION_NAME}"   --gen2   --runtime=nodejs20   --region="${REGION}"   --source="${WORKDIR}/repo/functions/newlife-refoundation-ai"   --entry-point=newlifeRefoundationAi   --trigger-http   --allow-unauthenticated   --memory=256Mi   --timeout=45s   --max-instances=1   --project="${PROJECT_ID}"   --set-env-vars=GCP_PROJECT="${PROJECT_ID}"   --quiet

URI="$(gcloud functions describe "${FUNCTION_NAME}"   --gen2   --region="${REGION}"   --project="${PROJECT_ID}"   --format='value(serviceConfig.uri)')"

if [ -z "${URI}" ]; then
  echo "BLOCKED: deployment produced no service URI." >&2
  exit 14
fi

echo "Smoke 1/2: interpret_turn"
INTERPRET_BODY='{"operation":"interpret_turn","utterance":"何が一番気になっている？","caseContext":"16:40。明日18時が初公演。美香は、自分の個人的体験が台本にほぼそのまま残っている場面をこのままでは演じないと言っている。亮は今変えると段取りが崩れると心配している。"}'
INTERPRET_RESP="$(curl -fsS --max-time 50 -X POST "${URI}" -H 'Content-Type: application/json' -d "${INTERPRET_BODY}")"
node -e '
const p=JSON.parse(process.argv[1]);
if(!p || typeof p.action!=="string" || typeof p.boundaryMode!=="string" || !Array.isArray(p.relationalEvents) || typeof p.needsClarification!=="boolean"){process.exit(2)}
' "${INTERPRET_RESP}"

echo "Smoke 2/2: generate_npc_line"
NPC_BODY='{"operation":"generate_npc_line","projection":{"npc":"MIKA","relationshipState":"NEUTRAL","boundaryStatus":"STATED","lastPlayerTurn":{"action":"ASK_BOUNDARY","boundaryMode":"DISCOVER","relationalEvents":[]},"sceneContext":"16:40。稽古停止中。プレイヤーが美香に何が一番気になるか尋ねた。"}}'
NPC_RESP="$(curl -fsS --max-time 50 -X POST "${URI}" -H 'Content-Type: application/json' -d "${NPC_BODY}")"
node -e '
const p=JSON.parse(process.argv[1]);
if(!p || p.npc!=="MIKA" || typeof p.text!=="string" || !p.text.trim()){process.exit(2)}
' "${NPC_RESP}"

TEST_URL="${TEST_BASE_URL}?endpoint=${URI}"

echo
echo "PDE009_SMOKE=PASS"
echo "PDE009_ENDPOINT=${URI}"
echo "PDE009_TEST_URL=${TEST_URL}"
echo
echo "Open PDE009_TEST_URL in your browser and test the conversation with your own words."
