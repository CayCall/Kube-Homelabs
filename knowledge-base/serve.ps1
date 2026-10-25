# Local mode: serves the knowledge base straight from disk.
# Usage: .\knowledge-base\serve.ps1   then open http://localhost:8090
param([int]$Port = 8090)

$site = Join-Path $PSScriptRoot "site"
Write-Host "Knowledge base: http://localhost:$Port  (Ctrl+C to stop)"
Start-Process "http://localhost:$Port"
python -m http.server $Port --bind 127.0.0.1 --directory $site
