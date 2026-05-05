#!/bin/bash
# Container entrypoint for the NanoClaw-powered AliExpress scraper agent.
#
# On startup:
#   1. Initialises the NanoClaw SQLite database + CLI agent group (idempotent).
#   2. Writes the scraper CLAUDE.md into the agent group folder.
#   3. Seeds the hourly recurring scraper task into the database.
#   4. Starts the NanoClaw daemon, which takes over all scheduling from here.

set -e

API_URL="${API_URL:-http://api:3000}"

echo "[entrypoint] Starting NanoClaw scraper agent..."
echo "[entrypoint] API_URL=${API_URL}"
echo "[entrypoint] NanoClaw version: $(cd /nanoclaw && node -e 'const p=require("./package.json");console.log(p.version)' 2>/dev/null || echo 'unknown')"

# ── Step 1: initialise DB + CLI agent group ────────────────────────────────
# init-cli-agent.ts runs migrations then creates the agent group and messaging
# wiring — it's safe to run multiple times (all operations are idempotent).
echo "[entrypoint] Initialising NanoClaw CLI agent group..."
cd /nanoclaw
pnpm exec tsx scripts/init-cli-agent.ts \
  --display-name "Ali-Auto" \
  --agent-name   "AliScraper" \
  --folder       "ali-scraper" \
  || echo "[entrypoint] Agent group already exists — continuing."

# ── Step 2: write the scraper CLAUDE.md ───────────────────────────────────
echo "[entrypoint] Writing scraper agent instructions..."
mkdir -p /nanoclaw/groups/ali-scraper
cp /agent/agent-claude.md /nanoclaw/groups/ali-scraper/CLAUDE.md

# ── Step 3: seed the hourly task ──────────────────────────────────────────
echo "[entrypoint] Seeding hourly scraper task..."
API_URL="$API_URL" SYNC_SECRET="$SYNC_SECRET" node /agent/seed-task.mjs

# ── Step 4: start NanoClaw ────────────────────────────────────────────────
echo "[entrypoint] Starting NanoClaw daemon..."
cd /nanoclaw
exec node dist/index.js
