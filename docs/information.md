# Container Images Used in This Repo

Scanned across all manifests/charts in this repo. Covers container images (not picture files —
there aren't any in this repo).

## Directly referenced in this repo's own manifests

| Image          | Used in                                   | Notes |
|----------------|--------------------------------------------|-------|
| `nginx:latest` | `nginx.yaml` (root) — Deployment, 2 replicas | Sample/test workload used to validate the cluster + deploy pipeline end-to-end. |
| `nginx:latest` | `app-roots/values.yaml` — Deployment, 3 replicas | Duplicate of the above with a different replica count. This file is named like a Helm values override but is actually a raw Deployment manifest — looks like a stray/leftover test file rather than real Argo CD chart values. Still flagged as an open item to clean up. |

`nginx:latest` pulls whatever the current stable nginx tag is at pull time — not pinned, so the
exact version can drift between cluster (re)creates. Worth pinning to a specific tag
(e.g. `nginx:1.27`) once this stops being a throwaway test.

## Pulled in via the vendored Argo CD chart

`app-roots/argocd/argocd-chart` (argo-helm chart, `Chart.yaml` reports `appVersion: 3.5.2`;
currently **deployed release is `v3.5.3`** — chart's default likely got bumped at install
time, or a values override pinned it). Default image repositories baked into the chart's
`values.yaml`:

| Image repository                              | Component                                    |
|------------------------------------------------|-----------------------------------------------|
| `dhi.io/argocd`                                | Core Argo CD components (server, repo-server, application-controller, applicationset-controller, notifications-controller) |
| `dhi.io/dex`                                   | Dex — SSO/OIDC identity broker used by Argo CD |
| `dhi.io/redis`                                 | Redis — Argo CD's internal cache               |
| `dhi.io/redis-exporter`                        | Prometheus metrics exporter for Redis (only runs if metrics are enabled) |
| `quay.io/argoprojlabs/argocd-extension-installer` | Optional UI extension installer — disabled unless explicitly turned on in values |

## Not yet in the repo (planned)

- **n8n** — image not yet decided/pinned; will land under `app-roots/n8n` once the Argo CD
  `Application` + chart values are set up (in progress — see `docs/argo-cd-deploy.md`).

## Open items

- [ ] Decide whether to pin `nginx:latest` to a specific version
- [ ] Resolve the `app-roots/values.yaml` duplicate-nginx-manifest situation
- [ ] Confirm why deployed Argo CD release (`v3.5.3`) differs from the chart's stated
      `appVersion` (`3.5.2`)
