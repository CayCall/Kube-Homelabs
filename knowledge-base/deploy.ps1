# Cluster mode: deploys the knowledge base into the kind cluster and port-forwards to it.
# Usage: .\knowledge-base\deploy.ps1   then open http://localhost:8091
param([int]$Port = 8091, [string]$Context = "Nebula")

$ErrorActionPreference = "Stop"

kubectl --context $Context apply -k $PSScriptRoot
kubectl --context $Context -n knowledge-base rollout status deployment/kb --timeout=120s

Write-Host "Knowledge base: http://localhost:$Port  (Ctrl+C to stop the port-forward)"
Start-Process "http://localhost:$Port"
kubectl --context $Context -n knowledge-base port-forward svc/kb "${Port}:80"
