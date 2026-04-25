#!/bin/bash
# Sets up automatic GitHub sync via a post-commit git hook.
# Run this once to configure the credential helper and install the hook.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_PATH="$SCRIPT_DIR/.git/hooks/post-commit"
CRED_HELPER="$SCRIPT_DIR/github-credential-helper.sh"

# Make credential helper executable
chmod +x "$CRED_HELPER"

# Configure git to use our credential helper
git config credential.helper "$CRED_HELPER"

# Install the post-commit hook
cat > "$HOOK_PATH" <<'EOF'
#!/bin/bash
# Auto-push to GitHub after each commit
REPO_DIR="$(git rev-parse --show-toplevel)"

# Load GITHUB_PAT from environment; fall back to .env file if needed
if [ -z "$GITHUB_PAT" ] && [ -f "$REPO_DIR/.env" ]; then
  export GITHUB_PAT=$(grep '^GITHUB_PAT=' "$REPO_DIR/.env" | cut -d '=' -f2-)
fi

if [ -z "$GITHUB_PAT" ]; then
  echo "[github-sync] GITHUB_PAT not set — skipping auto-push to GitHub."
  exit 0
fi

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
echo "[github-sync] Pushing to GitHub (origin/$BRANCH)..."

GIT_ASKPASS="$REPO_DIR/github-credential-helper.sh" \
  git push --force origin "$BRANCH" 2>&1

if [ $? -eq 0 ]; then
  echo "[github-sync] Successfully synced to GitHub."
else
  echo "[github-sync] Push failed — check your GITHUB_PAT secret and network access."
fi
EOF

chmod +x "$HOOK_PATH"

echo "GitHub auto-sync configured:"
echo "  Credential helper: $CRED_HELPER"
echo "  Post-commit hook:  $HOOK_PATH"
echo ""
echo "From now on, every 'git commit' will automatically push to GitHub."
