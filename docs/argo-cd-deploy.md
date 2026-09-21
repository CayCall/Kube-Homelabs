# Argo CD Deployment (kind on Windows)

## Cluster

- Local `kind` cluster, kubeconfig context renamed to **`nebula`**
  (`kubectl config rename-context kind-kind nebula`). Note: this only renamed the
  kubeconfig entry — the underlying kind cluster/container is still named `kind`
  (`kind get clusters` will show `kind`, not `nebula`).

```powershell
# from C:\Kuberenetes
.\kind-windows-amd64.exe create cluster
kubectl config rename-context kind-kind nebula
kubectl config use-context nebula
kubectl get nodes
```

## Argo CD install

Chart vendored locally at `app-roots\argocd\argocd-chart` (argo-helm chart, pulled with
`helm pull`/`dependency build` — includes `redis-chart` and `haproxy-chart` as deps).

```powershell
kubectl create namespace argocd
helm install argocd app-roots\argocd\argocd-chart -n argocd
kubectl -n argocd get pods -w
```

**Confirmed deployed:**

```
NAME     NAMESPACE  REVISION  STATUS    CHART           APP VERSION
argocd   argocd     1         deployed  argo-cd-10.9.2  v3.5.3
```

All 6 workloads (`argocd-server`, `argocd-repo-server`, `argocd-application-controller`,
`argocd-applicationset-controller`, `argocd-dex-server`, `argocd-redis`,
`argocd-notifications-controller`) are `Running`, `argocd-server` service is up on
`80/TCP,443/TCP`.

## Access the UI

**Option A — kubectl port-forward (always works):**

```powershell
kubectl -n argocd port-forward svc/argocd-server 8080:443
```

Then open https://localhost:8080 (accept the self-signed cert warning).

**Option B — OpenLens:**

Cluster shows up in OpenLens as **Nebula**. `argocd-server` lives under
**Network → Services** in the `argocd` namespace — tick `argocd` in the **Namespaces**
list first (checkbox in the left column, not clicking the row) or it won't show up under
Workloads/Network. From the service detail, use the port-forward icon.

TODO: set this up as a *persistent* forward via Lens's **Port Forwarding** page (left
sidebar, under Network) so it doesn't need to be re-triggered every session — see open
items below.

Get the initial admin password (same for either access method):

```powershell
kubectl -n argocd get secret argocd-initial-admin-secret `
  -o jsonpath="{.data.password}" | base64 -d
```

Login: `admin` / password from above.

## Open items

- [ ] Set up a persistent port-forward in OpenLens (Network → Port Forwarding page) instead
      of re-forwarding each session
- [ ] Longer-term: consider exposing `argocd-server` via a `NodePort` + kind
      `extraPortMappings` (set at cluster creation) instead of relying on port-forward at
      all — requires recreating the cluster with a kind config file
- [ ] Fill in `create-secret.sh` with the actual repo-credentials command for whatever git
      repo Argo CD should watch
- [ ] Add Application manifest(s) under `app-roots\Dev`
- [ ] Clean up / rename `app-roots\values.yaml` (currently a stray nginx manifest, not Helm
      values for the argocd chart)
- [ ] Fill in commands used in `Command Sheet\` (currently empty)
