#!/usr/bin/env bash
#
# ONE-TIME Owner-run bootstrap for the isolated NEW LIFE refoundation
# GitHub Actions deploy route (.github/workflows/newlife-refoundation-live.yml
# — see docs/newlife/refoundation/github-actions/newlife-refoundation-live.yml
# for why that file is not yet in .github/workflows/ directly, and
# docs/newlife/refoundation/V34_LIVE_DEPLOY_GITHUB_ACTIONS_BOOTSTRAP_V1.md
# for the full explanation).
#
# This script is NEVER executed automatically by any workflow, by Claude
# Code, or by any CI job. It requires an Owner's own already-authenticated
# `gcloud` session (a human with Owner/Editor rights on the target GCP
# project) and is meant to be read and run by hand, once.
#
# It sets up GitHub OIDC -> Google Cloud Workload Identity Federation so
# that .github/workflows/newlife-refoundation-live.yml can deploy
# functions/newlife-refoundation-ai/ WITHOUT any service-account JSON key
# ever existing on disk or in a GitHub secret. Every command below is
# idempotent (safe to re-run) -- it checks for existing resources before
# creating them, and `add-iam-policy-binding` is itself idempotent.
#
# Usage (this file is committed without the executable bit set -- run it
# via `bash`, or `chmod +x` it yourself first):
#   PROJECT_ID=<your-gcp-project-id> bash scripts/newlife-deploy/bootstrap-refoundation-wif.sh
#
# Optional:
#   RUNTIME_SERVICE_ACCOUNT=<email>  # if the deployed function should run as
#                                     # a non-default service account. Defaults
#                                     # to the project's default compute SA.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID, e.g. PROJECT_ID=gas-test-runner-20260620-wjxf bash scripts/newlife-deploy/bootstrap-refoundation-wif.sh}"
REPO="fukuoka1980521-beep/thinking-game"
POOL_ID="github-actions-pool"
PROVIDER_ID="github-actions-provider"
SA_ID="newlife-refoundation-deployer"
SA_EMAIL="${SA_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "== Bootstrapping GitHub Actions -> GCP Workload Identity Federation =="
echo "Project:    ${PROJECT_ID}"
echo "Repo:       ${REPO}"
echo "Deploy SA:  ${SA_EMAIL}"
echo ""

echo "-- Step 0: confirm billing is linked (required before enabling APIs) --"
if [ "$(gcloud billing projects describe "${PROJECT_ID}" --format='value(billingEnabled)' 2>/dev/null)" != "True" ]; then
  echo "ERROR: billing is not linked/enabled on project ${PROJECT_ID}." >&2
  echo "Link a billing account (Owner action, console or 'gcloud billing projects link') and re-run this script." >&2
  exit 1
fi
echo "Billing OK."
echo ""

echo "-- Step 1: enable required APIs (idempotent) --"
gcloud services enable \
  iamcredentials.googleapis.com \
  iam.googleapis.com \
  sts.googleapis.com \
  aiplatform.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  --project="${PROJECT_ID}"
echo ""

PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"

echo "-- Step 2: create the Workload Identity Pool (idempotent) --"
if gcloud iam workload-identity-pools describe "${POOL_ID}" \
    --project="${PROJECT_ID}" --location=global >/dev/null 2>&1; then
  echo "Pool ${POOL_ID} already exists, skipping create."
else
  gcloud iam workload-identity-pools create "${POOL_ID}" \
    --project="${PROJECT_ID}" \
    --location=global \
    --display-name="GitHub Actions"
fi
echo ""

echo "-- Step 3: create the OIDC provider, restricted to this exact repo (idempotent) --"
if gcloud iam workload-identity-pools providers describe "${PROVIDER_ID}" \
    --project="${PROJECT_ID}" --location=global --workload-identity-pool="${POOL_ID}" >/dev/null 2>&1; then
  echo "Provider ${PROVIDER_ID} already exists, skipping create."
else
  gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_ID}" \
    --project="${PROJECT_ID}" \
    --location=global \
    --workload-identity-pool="${POOL_ID}" \
    --display-name="GitHub OIDC" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository == '${REPO}'" \
    --issuer-uri="https://token.actions.githubusercontent.com"
fi
echo ""

echo "-- Step 4: create the deploy service account (idempotent) --"
if gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  echo "Service account ${SA_EMAIL} already exists, skipping create."
else
  gcloud iam service-accounts create "${SA_ID}" \
    --project="${PROJECT_ID}" \
    --display-name="NEW LIFE refoundation GitHub Actions deployer"
fi
echo ""

echo "-- Step 5: grant the deploy SA least-privilege roles to deploy the Gen2 function (idempotent) --"
# Deliberately NOT roles/owner, roles/editor, or serviceusage.services.enable --
# API enablement (Step 1 above) stays an Owner-run, one-time action, not
# something the CI service account can do on every run.
for ROLE in \
  roles/cloudfunctions.developer \
  roles/run.admin \
  roles/iam.serviceAccountUser \
  roles/artifactregistry.writer \
  roles/cloudbuild.builds.editor \
  roles/storage.objectViewer
do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" \
    --condition=None \
    >/dev/null
  echo "Granted ${ROLE} to ${SA_EMAIL}"
done
echo ""

echo "-- Step 6: allow ONLY this repo's GitHub Actions workflows to impersonate the deploy SA (idempotent) --"
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}" \
  >/dev/null
echo "Binding in place. Only workflow runs from ${REPO} can obtain a token as ${SA_EMAIL} -- no other repo, and no long-lived key, can."
echo ""

echo "-- Step 7: grant Vertex AI access to the function's RUNTIME service account (idempotent) --"
RUNTIME_SA="${RUNTIME_SERVICE_ACCOUNT:-${PROJECT_NUMBER}-compute@developer.gserviceaccount.com}"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/aiplatform.user" \
  --condition=None \
  >/dev/null
echo "Granted roles/aiplatform.user to runtime SA: ${RUNTIME_SA}"
echo "(This is the identity the deployed function calls Vertex AI as -- separate from the deploy SA above, which only deploys it.)"
echo "If you want a dedicated, narrower runtime SA instead of the default compute SA, create one yourself, re-run this step with RUNTIME_SERVICE_ACCOUNT=<email>, and set the optional GCP_RUNTIME_SERVICE_ACCOUNT repository variable below."
echo ""

echo "================================================================"
echo "Bootstrap complete. Set these as GitHub repository variables:"
echo "  (Settings > Secrets and variables > Actions > Variables tab, not Secrets)"
echo ""
echo "  GCP_PROJECT_ID=${PROJECT_ID}"
echo "  GCP_WIF_PROVIDER=projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"
echo "  GCP_DEPLOY_SERVICE_ACCOUNT=${SA_EMAIL}"
echo ""
echo "Optional (only if you used a custom RUNTIME_SERVICE_ACCOUNT in Step 7):"
echo "  GCP_RUNTIME_SERVICE_ACCOUNT=${RUNTIME_SA}"
echo ""
echo "No service-account JSON key was created or downloaded at any point."
echo "================================================================"
