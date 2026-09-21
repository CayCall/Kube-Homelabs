# Container Images Used in This Repo

Scanned across all manifests/charts/Dockerfiles in this repo. Covers container images (there
are no picture files in this repo).

## Directly referenced in this repo's own manifests

| Image                    | Used in                                          | Notes |
|---------------------------|---------------------------------------------------|-------|
| `nginx:latest`             | `nginx.yaml` (root) — Deployment, 2 replicas       | Sample/test workload used to validate the cluster + deploy pipeline end-to-end. |
| `nginx:latest`             | `app-roots/values.yaml` — Deployment, 3 replicas   | Duplicate of the above with a different replica count. Named like a Helm values override but is actually a raw Deployment manifest — still flagged as an open item to clean up. |
| `kalilinux/kali-rolling`   | `app-roots/KaliLinx-VirtualMachine/Dockerfile`     | Base image for a Docker-based Kali Linux "VM" — installs OpenSSH server/client, allows root login + password auth, exposes 22/443/80. Run via `docker-compose.yml` in the same folder (not part of the Kubernetes cluster — plain Docker, standalone learning exercise). |

`nginx:latest` and `kalilinux/kali-rolling` are both unpinned (`:latest` / rolling tag) — will
drift to whatever's current each time they're rebuilt/pulled.

⚠️ **Security note on the Kali image**: the Dockerfile hardcodes a root password
(`Qwerty@123`) with password auth + root SSH login enabled, and maps it to host ports
(`2222→22`, `8080→80`, `8000→443`). `docs/kali-vm.md` still documents the password as `kali` —
that doc is out of date vs. the actual Dockerfile. Fine for a local throwaway learning
container, but don't reuse that password or expose those ports beyond localhost.

## Pulled in via the vendored Argo CD chart

`app-roots/argocd/argocd-chart` (argo-helm chart, `Chart.yaml` reports `appVersion: 3.5.2`;
currently **deployed release is `v3.5.3`**). Default image repositories baked into the
chart's `values.yaml`:

| Image repository                                | Component                                    |
|----------------------------------------------------|-----------------------------------------------|
| `dhi.io/argocd`                                    | Core Argo CD components (server, repo-server, application-controller, applicationset-controller, notifications-controller) |
| `dhi.io/dex`                                       | Dex — SSO/OIDC identity broker used by Argo CD |
| `dhi.io/redis`                                     | Redis — Argo CD's internal cache               |
| `dhi.io/redis-exporter`                            | Prometheus metrics exporter for Redis (only runs if metrics are enabled) |
| `quay.io/argoprojlabs/argocd-extension-installer`  | Optional UI extension installer — disabled unless explicitly turned on in values |

## Not yet in the repo (planned)

- **n8n** — image not yet decided/pinned; will land under `app-roots/n8n` once the Argo CD
  `Application` + chart values are set up (in progress — see `docs/argo-cd-deploy.md`).

## Open items

- [ ] Decide whether to pin `nginx:latest` to a specific version
- [ ] Resolve the `app-roots/values.yaml` duplicate-nginx-manifest situation
- [ ] Confirm why deployed Argo CD release (`v3.5.3`) differs from the chart's stated
      `appVersion` (`3.5.2`)
- [ ] Change the hardcoded Kali root password, and/or switch to SSH-key auth instead of
      password auth
- [ ] Update `docs/kali-vm.md` — it still documents the old `kali` password instead of the
      current `Qwerty@123`
