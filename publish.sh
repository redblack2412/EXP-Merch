#!/bin/zsh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "Fehler: git ist nicht installiert."
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" != "main" ]]; then
  echo "Fehler: Bitte auf Branch 'main' wechseln (aktuell: $BRANCH)."
  exit 1
fi

MESSAGE="${1:-Update $(date '+%Y-%m-%d %H:%M')}"

git add .

if git diff --cached --quiet; then
  echo "Keine Änderungen zum Veröffentlichen."
  exit 0
fi

git commit -m "$MESSAGE"
git push origin main

echo ""
echo "Fertig. Deine Live-App:"
echo "https://redblack2412.github.io/EXP-Merch/"
