#!/bin/bash
# Container entrypoint.
# 1. Runs the scraper once immediately on startup.
# 2. Starts cron for hourly runs.

set -e

echo "[entrypoint] Starting NanoClaw scraper agent..."
echo "[entrypoint] API_URL=${API_URL:-http://api:3000}"

# Run immediately on boot so you don't wait an hour for the first sync
echo "[entrypoint] Running initial scrape..."
/agent/run-scraper.sh || echo "[entrypoint] Initial scrape failed — cron will retry on next hour."

# Start cron in foreground
echo "[entrypoint] Starting cron daemon (hourly schedule)..."
exec crond -f -l 6
