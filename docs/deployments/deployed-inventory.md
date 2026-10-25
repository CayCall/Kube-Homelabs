# Deployed Inventory — What's Running So Far

Snapshot of everything deployed in the homelab as of **2026-10-25**, taken from the live
cluster (not just the manifests in this repo). Two separate environments:

1. **Kubernetes** — a single-node `kind` cluster (kubeconfig context **`Nebula`**)
2. **Plain Docker** — the standalone Kali Linux "VM" container (not part of Kubernetes)

```
Windows 11 host (Docker Desktop, WSL2 backend)
├── container: kind-control-plane   ← the whole Kubernetes cluster lives in here
│   ├── ns argocd        → Argo CD (Helm release "argocd")
│   ├── ns default       → nginx Deployment (2 replicas) + bare "kali" pod
│   ├── ns kube-system   → cluster core (apiserver, etcd, coredns, kindnet, ...)
│   └── ns local-path-storage → default StorageClass provisioner
└── container: kali-vm             ← docker compose, SSH on localhost:2222
```

## 1. The cluster

| Item               | Value                                                        |
|--------------------|--------------------------------------------------------------|
| Tool               | `kind` (`kind-windows-amd64.exe` in repo root, git-ignored)  |
| kind cluster name  | `kind` (node container: `kind-control-plane`)                |
| kubeconfig context | `Nebula` (renamed from `kind-kind` — see `argo-cd-deploy.md`) |
| Kubernetes version | `v1.36.1` (node image `kindest/node:v1.36.1`)                |
| Nodes              | 1 — `kind-control-plane` (control-plane + workloads)          |
| Runtime            | containerd 2.3.1, Debian 13 node image, WSL2 kernel          |
| API server         | `https://127.0.0.1:53551`                                    |
| Pod CIDR           | `10.244.0.0/16` (kindnet CNI)                                 |
| Service CIDR       | `10.96.0.0/12`                                               |
| Storage            | `standard` (default) StorageClass → `rancher.io/local-path`  |
| Age                | ~73 days (created around 2026-08-13)                          |

### Built-in system components (came with kind — nothing to manage)

| Namespace            | Component                          | Purpose                          |
|----------------------|------------------------------------|----------------------------------|
| `kube-system`        | `kube-apiserver`, `etcd`, `kube-scheduler`, `kube-controller-manager` | Control plane |
| `kube-system`        | `coredns` (2 replicas)             | Cluster DNS (`kube-dns` service)  |
| `kube-system`        | `kindnet` (DaemonSet)              | Pod networking (CNI)             |
| `kube-system`        | `kube-proxy` (DaemonSet)           | Service routing                  |
| `local-path-storage` | `local-path-provisioner`           | Creates PVs on the node's disk   |

## 2. Argo CD (namespace `argocd`)

Installed with Helm on ~2026-09-22.

| Item          | Value                                         |
|---------------|-----------------------------------------------|
| Helm release  | `argocd` (revision 1)                         |
| Chart         | `argo-cd-10.9.2` (**upstream** argo-helm chart) |
| App version   | `v3.5.3`                                      |

### Workloads

| Workload                                  | Kind        | Image                                              | Role |
|-------------------------------------------|-------------|----------------------------------------------------|------|
| `argocd-server`                           | Deployment  | `quay.io/argoproj/argocd:v3.5.3`                    | Web UI + API |
| `argocd-repo-server`                      | Deployment  | `quay.io/argoproj/argocd:v3.5.3`                    | Clones git repos, renders manifests |
| `argocd-application-controller`           | StatefulSet | `quay.io/argoproj/argocd:v3.5.3`                    | Compares git vs cluster, syncs |
| `argocd-applicationset-controller`        | Deployment  | `quay.io/argoproj/argocd:v3.5.3`                    | Generates Applications from templates |
| `argocd-notifications-controller`         | Deployment  | `quay.io/argoproj/argocd:v3.5.3`                    | Alerts on sync events |
| `argocd-dex-server`                       | Deployment  | `ghcr.io/dexidp/dex:v2.45.1`                        | SSO / OIDC broker |
| `argocd-redis`                            | Deployment  | `ecr-public.aws.com/docker/library/redis:8.6.4-alpine` | Cache |

### Services (all `ClusterIP` — nothing is exposed outside the cluster)

| Service                            | Ports          |
|------------------------------------|----------------|
| `argocd-server`                    | 80, 443        |
| `argocd-repo-server`               | 8081           |
| `argocd-applicationset-controller` | 7000           |
| `argocd-dex-server`                | 5556, 5557     |
| `argocd-redis`                     | 6379           |

Access the UI with a port-forward (details + admin password in `docs/argo-cd-deploy.md`):

```powershell
kubectl --context Nebula -n argocd port-forward svc/argocd-server 8080:443
# https://localhost:8080 — but note kali-vm already uses host port 8080, pick another, e.g. 9443:443
```

### Argo CD config state

- **Applications:** none yet. Only the built-in `default` AppProject exists.
- **Repositories / credentials:** none configured.
- **Secrets present:** `argocd-initial-admin-secret`, `argocd-secret`,
  `argocd-notifications-secret`, `argocd-redis`, plus the Helm release secret.

### ⚠️ Deployed chart ≠ vendored chart

The chart in `app-roots/argocd/argocd-chart` is the **Docker Hardened Images** variant
(`argocd-chart` 10.9.1, appVersion 3.5.2, images from `dhi.io`). The cluster is running the
**upstream** `argo-cd` 10.9.2 chart with `quay.io`/`ghcr.io` images. So the install was done
from the upstream repo (e.g. `helm install argocd argo/argo-cd`), not from the local folder.
This is why `docs/information.md` saw a 3.5.2 vs 3.5.3 mismatch.

## 3. Workloads in the `default` namespace

| Resource       | Kind                    | Image                    | Source in repo | Notes |
|----------------|-------------------------|--------------------------|----------------|-------|
| `nginx`        | Deployment, 2 replicas  | `nginx:latest`           | `nginx.yaml`   | Test workload used to validate the cluster. No Service, so it's not reachable outside its pods. |
| `kali`         | Bare Pod (no controller)| `kalilinux/kali-rolling` | **none**       | Created 2026-09-21 by hand, probably with `kubectl run kali --image=kalilinux/kali-rolling -it -- /bin/bash`. No manifest in git. Since it's a bare pod, it won't be recreated if deleted. |

`app-roots/values.yaml` is another nginx Deployment with 3 replicas and the same name. It is
**not** what's applied; the live Deployment has 2 replicas, which matches `nginx.yaml`.

## 3b. Knowledge base (namespace `knowledge-base`)

Added 2026-10-25 from `knowledge-base/` (`kubectl apply -k knowledge-base`).

| Resource         | Kind                 | Notes                                                   |
|------------------|----------------------|---------------------------------------------------------|
| `kb`             | Deployment, 1 replica | `nginx:1.29-alpine`, read-only root filesystem, probes |
| `kb-site-<hash>` | ConfigMap            | The site's HTML/CSS/JS, generated by Kustomize          |
| `kb`             | Service (ClusterIP)  | Port 80. Open with `.\knowledge-base\deploy.ps1` → http://localhost:8091 |

Not managed by Argo CD yet. `knowledge-base/argocd/application.yaml` does that once the
folder is merged to `main`.

## 4. Kali Linux VM (plain Docker, outside Kubernetes)

| Item        | Value                                                        |
|-------------|--------------------------------------------------------------|
| Container   | `kali-vm`, image `kuberenetes-kali` (built locally)          |
| Source      | `app-roots/KaliLinux-VirtualMachine/` (`Dockerfile` + `docker-compose.yml`) |
| Ports       | `2222→22` (SSH), `8080→80`, `8000→443`                        |
| Restart     | `unless-stopped` (comes back with Docker Desktop)            |
| Login       | `ssh root@localhost -p 2222`. The password is set in the Dockerfile. |

Full build/run guide: `docs/kali-vm.md`. That doc still shows the old password, so check the
Dockerfile for the current one.

## 5. Images in use (live)

| Image                                                   | Where                    |
|---------------------------------------------------------|--------------------------|
| `kindest/node:v1.36.1`                                  | kind node container      |
| `quay.io/argoproj/argocd:v3.5.3`                         | Argo CD core components  |
| `ghcr.io/dexidp/dex:v2.45.1`                             | Argo CD Dex              |
| `ecr-public.aws.com/docker/library/redis:8.6.4-alpine`   | Argo CD Redis            |
| `nginx:latest`                                           | `default/nginx`          |
| `kalilinux/kali-rolling`                                 | `default/kali` pod + base of `kali-vm` |

## 6. Known issues / gotchas

- **`kubectl` fails with `x509: certificate signed by unknown authority`.** AVG Antivirus Web
  Shield intercepts HTTPS to `127.0.0.1` and re-signs the API server's certificate with
  `AVG Web/Mail Shield Untrusted Root`. Fix: add `https://127.0.0.1` / `https://localhost`
  (or `kubectl.exe`) to AVG → Web Shield → Exceptions, or turn off HTTPS scanning.
  Workaround while it's broken:
  ```bash
  docker exec kind-control-plane kubectl --kubeconfig /etc/kubernetes/admin.conf get pods -A
  ```
  (In Git Bash, prefix with `MSYS_NO_PATHCONV=1` so the path isn't rewritten.)
- **Wrong default context.** The current context is `docker-desktop`, not `Nebula`. Run
  `kubectl config use-context Nebula` to target the kind cluster.
- **Context name casing.** `argo-cd-deploy.md` says `nebula`, but the kubeconfig actually has
  `Nebula`. Context names are case-sensitive.
- **Host port 8080 conflict.** `kali-vm` holds host port 8080, so the Argo CD port-forward in
  `argo-cd-deploy.md` (`8080:443`) will fail while that container runs.

## 7. Not deployed yet (planned)

- Argo CD `Application` manifests (planned under `app-roots/Dev`)
- n8n (planned under `app-roots/n8n`)
- Repo credentials for Argo CD (`app-roots/create-secret.sh` is still a placeholder; it creates
  a Docker Hub pull secret, not a git repo secret)
- Ingress / NodePort exposure. Nothing is reachable from the host without a port-forward.

## How to refresh this inventory

```powershell
kubectl config use-context Nebula
kubectl get nodes -o wide
kubectl get deploy,sts,ds,pods,svc -A
kubectl get applications,appprojects -n argocd
helm list -A
docker ps
```
