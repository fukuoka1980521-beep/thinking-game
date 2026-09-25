#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gas-test-runner-20260620-wjxf}"
REGION="${REGION:-asia-northeast1}"
FUNCTION_NAME="newlife-refoundation-ai"
SOURCE_BRANCH="chatgpt/newlife-refoundation-v1"
REPO_URL="https://github.com/fukuoka1980521-beep/thinking-game.git"
TEST_BASE_URL="https://fukuoka1980521-beep.github.io/thinking-game/newlife-v37.html"

echo "NEW LIFE V37 live human-test bootstrap"
echo "Project: ${PROJECT_ID}"
echo "Region:  ${REGION}"
echo "Mode: isolated backend deploy + V37 smoke + human-test URL"

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

echo "Fetching V37 isolated refoundation backend..."
git clone --quiet --depth 1 --branch "${SOURCE_BRANCH}" "${REPO_URL}" "${WORKDIR}/repo"

echo "Deploying isolated V37 backend (legacy public NEW LIFE is untouched)..."
gcloud functions deploy "${FUNCTION_NAME}"   --gen2   --runtime=nodejs20   --region="${REGION}"   --source="${WORKDIR}/repo/functions/newlife-refoundation-ai"   --entry-point=newlifeRefoundationAi   --trigger-http   --allow-unauthenticated   --memory=256Mi   --timeout=45s   --max-instances=1   --project="${PROJECT_ID}"   --set-env-vars=GCP_PROJECT="${PROJECT_ID}"   --quiet

URI="$(gcloud functions describe "${FUNCTION_NAME}"   --gen2   --region="${REGION}"   --project="${PROJECT_ID}"   --format='value(serviceConfig.uri)')"

if [ -z "${URI}" ]; then
  echo "BLOCKED: deployment produced no service URI." >&2
  exit 14
fi

echo "Smoke 1/2: converse_turn"
CONVERSE_BODY='{"operation":"converse_turn","caseId":"COMMUNITY_THEATER_V1","targetNpc":"MIKA","rawPlayerUtterance":"なんで今まで言わなかったの？","recentDialogue":[{"speaker":"MIKA","text":"この場面、明日はやりません。ここを変えないなら、私は出ません。"},{"speaker":"RYO","text":"昨日まではやってただろ。今ここで変えたら、全員の段取りが崩れる。"}],"dynamicState":{"relationshipState":"NEUTRAL","boundaryStatus":"UNKNOWN","remainingMinutes":50,"activeCommitment":null}}'
CONVERSE_RESP="$(curl -fsS --max-time 50 -X POST "${URI}" -H 'Content-Type: application/json' -d "${CONVERSE_BODY}")"
node -e '
const p=JSON.parse(process.argv[1]);
if(!p || p.npc!=="MIKA" || typeof p.npcLine!=="string" || !p.npcLine.trim() || typeof p.understoodPlayerMeaning!=="string" || !p.candidateTurn || typeof p.candidateTurn.action!=="string"){process.exit(2)}
' "${CONVERSE_RESP}"

echo "Smoke 2/2: organize_thought"
THOUGHT_BODY='{"operation":"organize_thought","validatedWorldFacts":"明日18:00が初回公演。チケットは販売済み。17:30までに対応方針を決める必要がある。","recentDialogue":[{"speaker":"MIKA","text":"この場面、明日はやりません。ここを変えないなら、私は出ません。"}],"currentProblem":"美香と亮の対立を理解し、明日の公演をどう進めるか決める。"}'
THOUGHT_RESP="$(curl -fsS --max-time 50 -X POST "${URI}" -H 'Content-Type: application/json' -d "${THOUGHT_BODY}")"
node -e '
const p=JSON.parse(process.argv[1]);
if(!p || !Array.isArray(p.known) || !Array.isArray(p.possible) || !Array.isArray(p.unknown) || !Array.isArray(p.options) || !(p.nextCheck===null || typeof p.nextCheck==="string")){process.exit(2)}
' "${THOUGHT_RESP}"

TEST_URL="${TEST_BASE_URL}?endpoint=${URI}"

echo
echo "PDE010_SMOKE=PASS"
echo "PDE010_ENDPOINT=${URI}"
echo "PDE010_TEST_URL=${TEST_URL}"
echo
echo "Open PDE010_TEST_URL and test V37 free conversation + separate thought organization."
