# STGR/LSCB v0.4 — Cloud Shell direct fallback

This fallback exists because the GitHub Actions WIF repository variables are
currently absent. It uses the already-authenticated Cloud Shell user session,
not a service-account key.

The frozen experiment package, scenarios, conditions, manifest, and gold labels
are unchanged. The only runtime difference from the GitHub Actions route is the
access-token source: `gcloud auth print-access-token` instead of the instance
metadata service.

One command from Cloud Shell:

```bash
rm -rf ~/stgr-v04-run && git clone --depth 1 --branch research/stgr-lscb-v04 https://github.com/fukuoka1980521-beep/thinking-game.git ~/stgr-v04-run && cd ~/stgr-v04-run && python3 research/stgr-lscb-v04/cloudshell_direct_run.py
```

Expected output is `research/stgr-lscb-v04/STGR_LSCB_RESULTS_V0_4.zip`.
A technical failure exits nonzero and prints the frozen technical-failure JSON.
