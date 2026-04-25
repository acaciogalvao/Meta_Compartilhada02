#!/bin/bash
# Automatic GitHub sync daemon.
# Polls for uncommitted changes every INTERVAL seconds, then auto-commits and pushes.
# Runs as a persistent background workflow configured in .replit.

set -euo pipefail

INTERVAL="${GITHUB_SYNC_INTERVAL:-30}"
BRANCH="${GITHUB_SYNC_BRANCH:-main}"
REPO_DIR="$(git rev-parse --show-toplevel 2>/dev/null || echo ".")"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [github-sync] $*"; }

# Verify GITHUB_PAT is available
if [ -z "${GITHUB_PAT:-}" ]; then
  log "ERROR: GITHUB_PAT secret is not set. Auto-sync disabled."
  log "Set the GITHUB_PAT secret in Replit Secrets and restart this workflow."
  exit 1
fi

# Configure git identity and credential helper (idempotent)
git -C "$REPO_DIR" config user.email "${GITHUB_USER_EMAIL:-acaciogalvao@users.noreply.github.com}"
git -C "$REPO_DIR" config user.name "${GITHUB_USER_NAME:-Acacio Galvao}"
git -C "$REPO_DIR" config credential.helper "$REPO_DIR/github-credential-helper.sh"

log "GitHub auto-sync started (polling every ${INTERVAL}s, branch: ${BRANCH})."
log "Changes will be committed and pushed to origin/${BRANCH} automatically."

push_changes() {
  local timestamp
  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

  # Stage all changes (tracked + new files), excluding .local/
  git -C "$REPO_DIR" add -A -- ':!.local/' 2>/dev/null || git -C "$REPO_DIR" add -A

  # Check if there is anything staged
  if git -C "$REPO_DIR" diff --cached --quiet; then
    return 0
  fi

  log "Changes detected — creating auto-commit..."
  git -C "$REPO_DIR" commit -m "Auto-sync: ${timestamp}" --no-verify

  log "Pushing to GitHub (origin/${BRANCH})..."

  # Pull remote changes first (rebase) to avoid force-push
  GIT_ASKPASS="$REPO_DIR/github-credential-helper.sh" \
    git -C "$REPO_DIR" pull --rebase origin "$BRANCH" 2>&1 || {
    log "WARN: Pull/rebase failed — skipping push to avoid overwriting remote work."
    return 1
  }

  GIT_ASKPASS="$REPO_DIR/github-credential-helper.sh" \
    git -C "$REPO_DIR" push origin "$BRANCH" 2>&1

  log "Successfully synced to GitHub."
}

while true; do
  # Check for uncommitted changes (tracked files or untracked files)
  if ! git -C "$REPO_DIR" diff --quiet HEAD 2>/dev/null || \
     git -C "$REPO_DIR" status --porcelain 2>/dev/null | grep -qv '^\?\?'; then
    push_changes || log "WARN: Sync failed this cycle; will retry next interval."
  fi

  sleep "$INTERVAL"
done
