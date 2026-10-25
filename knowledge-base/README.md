# Knowledge Base

A beginner's Kubernetes course built around this homelab, plus a knowledge base about this
repo. It's a small website with 13 lessons, each with hands-on labs against the `Nebula`
kind cluster.

## Open it

| Mode    | Command                        | URL                   | Needs                       |
|---------|--------------------------------|-----------------------|-----------------------------|
| Local   | `.\knowledge-base\serve.ps1`   | http://localhost:8090 | Python                      |
| Cluster | `.\knowledge-base\deploy.ps1`  | http://localhost:8091 | Running cluster + kubectl   |

Run both from `C:\Kuberenetes`. If PowerShell blocks the script, run it once with
`powershell -ExecutionPolicy Bypass -File .\knowledge-base\serve.ps1`.

## Layout

```
knowledge-base/
├── site/                  the website (index.html holds every lesson as an <article>)
├── k8s/                   Namespace, Deployment (nginx), Service
├── kustomization.yaml     bundles k8s/ and turns site/ into a ConfigMap
├── argocd/application.yaml  hands it to Argo CD (GitOps lab, lesson 11)
├── serve.ps1              local mode
└── deploy.ps1             cluster mode
```

## Contents

**Learn Kubernetes:** Containers & Docker · What Kubernetes Is · kubectl & Contexts · Pods ·
Deployments · Namespaces & Labels · Networking & Services · ConfigMaps & Secrets · Storage ·
Helm · GitOps & Argo CD · Managing Secrets · Troubleshooting

**This Repo:** Repo Map · What's Deployed · How This Site Runs · Open Items · Cheat Sheet ·
Glossary

All labs run in a `playground` namespace; `kubectl delete namespace playground` cleans up.

## Editing

Add or change an `<article data-title="…" data-group="learn|repo">` in `site/index.html`.
The sidebar, prev/next buttons and progress tracking are generated automatically. Keep the
site files under ~250 KB in total (client-side `kubectl apply` annotation limit).
