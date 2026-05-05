#!/bin/bash
# Invoked by cron every hour.
# Reads the scraper prompt and runs it via Claude Code CLI.

set -e

PROMPT_FILE="/agent/scraper-prompt.md"
API_URL="${API_URL:-http://api:3000}"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] [scraper]"

echo "$LOG_PREFIX Starting AliExpress scrape..."

# Inject runtime variables into the environment so the agent can read them
export SYNC_SECRET="${SYNC_SECRET}"
export API_URL="${API_URL}"

# Replace localhost references in the prompt with the actual API_URL
PROMPT=$(sed "s|http://localhost:3000|${API_URL}|g" "$PROMPT_FILE")

# Run claude in non-interactive (print) mode
claude --dangerously-skip-permissions -p "$PROMPT"

echo "$LOG_PREFIX Done."
