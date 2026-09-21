# Git Workflow — Feature Branch → main

Rule: never commit or push directly to `main`. All changes go through a feature branch first,
and only get merged into `main` once they're done/working.

## 1. Start a new branch off main

```powershell
# make sure main is up to date first
git checkout main
git pull

# create + switch to a new branch
git checkout -b feature/n8n-argocd-app
```

Branch naming convention: `feature/<short-description>` (e.g. `feature/n8n-argocd-app`,
`feature/fix-nginx-replicas`). Use `fix/...` for bugfixes if you want to distinguish.

## 2. Make your changes, commit to the branch

```powershell
git status                 # see what changed
git add .                  # stage it (or `git add <specific-file>` to be selective)
git status                 # confirm what's staged before committing
git commit -m "Add n8n Argo CD Application manifest"
```

Commit as often as makes sense — small, descriptive commits are easier to review/revert than
one giant commit at the end.

## 3. Push the branch (NOT main)

```powershell
git push -u origin feature/n8n-argocd-app
```

`-u` only needed the first time you push this branch — after that, plain `git push` works
since it remembers the upstream.

## 4. Merge into main once it's working/validated

Option A — **via GitHub** (recommended, gives you a review step even solo):
1. Open the repo on GitHub — it'll show a prompt to open a Pull Request for the branch you
   just pushed.
2. Open the PR, review the diff, merge it (Squash/Merge/Rebase — squash is usually cleanest
   for solo homelab work).
3. Locally, switch back and pull the merged result:

```powershell
git checkout main
git pull
```

Option B — **merge locally** (skip GitHub, just merge and push main directly):

```powershell
git checkout main
git pull
git merge feature/n8n-argocd-app
git push origin main
```

⚠️ Only push to `main` as this final merge step — never commit new work directly on `main`.

## 5. Clean up the branch (optional)

```powershell
git branch -d feature/n8n-argocd-app              # delete local branch
git push origin --delete feature/n8n-argocd-app   # delete remote branch
```

⚠️ `-d` (lowercase) refuses to delete if the branch has unmerged changes — safe default.
`-D` (uppercase) force-deletes even if unmerged; only use that if you're sure you want to
throw the branch's changes away.

## Quick reference

| Step              | Command                                      |
|-------------------|-----------------------------------------------|
| New branch        | `git checkout -b feature/<name>`              |
| Stage + commit    | `git add .` → `git commit -m "..."`           |
| Push branch       | `git push -u origin feature/<name>`           |
| Merge to main     | PR on GitHub, or `git merge` locally          |
| Update local main | `git checkout main` → `git pull`              |
