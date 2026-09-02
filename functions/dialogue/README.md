# dialogue Cloud Function

Stateless HTTP Cloud Function (Gen 2) that proxies a single CASE-001 dialogue
turn to Vertex AI Gemini. See `docs/DECISIONS.md` for why this exists and
`docs/SAFETY_PRINCIPLES.md` / `docs/DATA_BOUNDARY.md` for the product's
privacy guarantees this function must not violate.

## Why no API key exists anywhere

This function authenticates to Vertex AI using its own Cloud Run/Cloud
Functions service account identity (Application Default Credentials) — not
a manually issued API key. Nothing here, in the deployed artifact, or in the
frontend bundle ever holds a secret string.

## What it receives / never receives

Receives only: case narrative text (situation/question/choice labels), the
player's own choice, confidence, selected info option labels, and their
written reason. **Never receives** rubric ground truth, other cases, Growth
history, or any device/user identifier (data minimization, Section 15).
Never writes to a database or log store beyond Cloud Functions' own
transient stdout/stderr (which only ever logs the error *type*, never the
request body — see the `catch` block in `index.js`).

## Prerequisites (Owner action, not automatable)

1. A billing account linked to the GCP project (`gcloud billing projects
   describe <project>` must show `billingEnabled: true`). Linking billing
   requires entering a payment method in the Cloud Console and cannot be
   done by an agent.
2. Enable required APIs once billing is linked:
   ```
   gcloud services enable aiplatform.googleapis.com cloudfunctions.googleapis.com \
     cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com \
     --project <project-id>
   ```

## Deploy

```
gcloud functions deploy dialogue \
  --gen2 \
  --runtime=nodejs20 \
  --region=asia-northeast1 \
  --source=. \
  --entry-point=dialogue \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256Mi \
  --timeout=20s \
  --max-instances=10 \
  --project=<project-id>
```

`--max-instances=10` is a deliberate, cheap first line of defense against
runaway cost from an unauthenticated public endpoint — the CORS allowlist in
`index.js` is the second line (only `https://fukuoka1980521-beep.github.io`
and local dev origins may call it), but neither is a substitute for the
Owner watching Cloud Billing budget alerts. **No request-rate limiting
beyond `--max-instances` is implemented this Run** — see `KNOWN_LIMITS` in
the CLOSE report.

After deploy, copy the printed HTTPS trigger URL into
`src/lib/aiDialogueClient.ts`'s `DIALOGUE_ENDPOINT_URL` constant, then
rebuild and redeploy the frontend.

## Local validation (no credentials needed)

`index.js`'s request validation, CORS handling, and method checks were
smoke-tested locally with a mock `req`/`res` (script not committed — it
never touches `getClient()`, so it needs no Vertex AI credentials at all).
The actual Vertex AI call itself has **not** been exercised end-to-end,
since it requires the billing/API-enablement step above.
