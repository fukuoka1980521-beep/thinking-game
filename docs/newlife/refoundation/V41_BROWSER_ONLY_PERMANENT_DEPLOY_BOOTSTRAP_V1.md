# NEW LIFE — browser-only one-time GCP trust bootstrap (V41)

## Purpose

Normal NEW LIFE updates must no longer require Google Cloud Shell or a local terminal.

The permanent route is:

```
chatgpt/newlife-refoundation-v1 push
  -> GitHub Actions
  -> Google Cloud Workload Identity Federation
  -> isolated newlife-refoundation-ai deploy
  -> health/build-SHA verification
  -> converse_turn smoke
  -> organize_thought smoke
  -> same human-test page
```

Repository-side automation is already prepared. The only remaining bootstrap is a **one-time Google Cloud Console setup** that allows this exact GitHub repository to impersonate one deploy-only service account. After that, future pushes deploy automatically.

Project:

```
gas-test-runner-20260620-wjxf
```

Repository:

```
fukuoka1980521-beep/thinking-game
```

No service-account JSON key is created or downloaded.

---

## 1. Create the deploy service account

Open:

https://console.cloud.google.com/iam-admin/serviceaccounts?project=gas-test-runner-20260620-wjxf

Create:

```
Name: NEW LIFE refoundation GitHub deployer
Service account ID: newlife-refoundation-deployer
```

Resulting email:

```
newlife-refoundation-deployer@gas-test-runner-20260620-wjxf.iam.gserviceaccount.com
```

Grant these project roles to that service account:

- Cloud Functions Developer — `roles/cloudfunctions.developer`
- Cloud Run Admin — `roles/run.admin`
- Service Account User — `roles/iam.serviceAccountUser`
- Artifact Registry Writer — `roles/artifactregistry.writer`
- Cloud Build Editor — `roles/cloudbuild.builds.editor`
- Storage Object Viewer — `roles/storage.objectViewer`

Do **not** grant Owner or Editor.

The currently deployed function already has a working runtime identity for Vertex AI; the GitHub deploy identity is only for deployment and is kept separate from runtime use.

---

## 2. Create the GitHub Workload Identity pool/provider

Open:

https://console.cloud.google.com/iam-admin/workload-identity-pools?project=gas-test-runner-20260620-wjxf

Create a pool:

```
Pool name: GitHub Actions
Pool ID: github-actions-pool
```

Add an OIDC provider:

```
Provider name: GitHub Actions
Provider ID: github-actions-provider
Issuer URL: https://token.actions.githubusercontent.com/
Audience: Default audience
```

Attribute mapping:

```
google.subject = assertion.sub
attribute.repository = assertion.repository
attribute.repository_owner = assertion.repository_owner
```

Attribute condition:

```
assertion.repository == 'fukuoka1980521-beep/thinking-game'
```

This condition is important: tokens from another GitHub repository must not be able to use this provider.

---

## 3. Allow only this repository to impersonate the deploy service account

In the Workload Identity provider / service-account access flow, grant:

```
Role: Workload Identity User
Target service account:
newlife-refoundation-deployer@gas-test-runner-20260620-wjxf.iam.gserviceaccount.com
```

The principal must correspond to this repository attribute:

```
attribute.repository/fukuoka1980521-beep/thinking-game
```

The resulting principal binding is equivalent to:

```
principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/fukuoka1980521-beep/thinking-game
```

Use the numeric **project number**, not the project ID, in that principal resource.

---

## 4. Copy the provider resource name

After the provider is created, copy its full provider resource name:

```
projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
```

This value is not a secret.

---

## 5. Set the one remaining GitHub repository variable

Open:

https://github.com/fukuoka1980521-beep/thinking-game/settings/variables/actions

Create exactly one repository variable:

```
Name: GCP_WIF_PROVIDER
Value: projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
```

Project ID and deploy service-account email are already fixed in the reviewed workflow, so no other GitHub variable is required for the normal route.

---

## 6. What happens afterward

No Cloud Shell is needed for routine NEW LIFE development.

A change under `functions/newlife-refoundation-ai/**` on `chatgpt/newlife-refoundation-v1` automatically runs:

1. WIF authentication
2. isolated backend deployment
3. exact source-SHA embedding
4. GET health/build identity check
5. `converse_turn` smoke
6. `organize_thought` smoke

The human-test page:

https://fukuoka1980521-beep.github.io/thinking-game/newlife-v37.html

no longer trusts a stale endpoint from browser local storage. It refuses to start unless the isolated backend exposes the new health/build identity response.

---

## Safety boundary

This bootstrap changes IAM because a permanent CI deploy identity must exist somewhere. That one Google-side authorization step cannot be performed by the current ChatGPT/GitHub connector because it has no authenticated Google Cloud IAM executor.

Everything after that boundary is designed to be automatic and repeatable.
