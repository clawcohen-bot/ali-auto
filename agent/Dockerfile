# NanoClaw Scraper Agent
# Runs the AliExpress car accessories scraper every hour via cron.
#
# Required environment variables:
#   ANTHROPIC_API_KEY   — Anthropic API key for Claude
#   SYNC_SECRET         — Must match the backend's SYNC_SECRET
#   API_URL             — Backend URL (default: http://api:3000)

FROM node:20-alpine

# Install cron + bash
RUN apk add --no-cache dcron bash curl

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /agent

# Copy the prompt
COPY scraper-prompt.md ./

# Entrypoint script: runs the agent once, then sets up hourly cron
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Wrapper that calls `claude -p` with the prompt
COPY run-scraper.sh ./
RUN chmod +x run-scraper.sh

# Cron: run every hour at minute 0, log to stdout
RUN echo "0 * * * * /agent/run-scraper.sh >> /proc/1/fd/1 2>> /proc/1/fd/2" \
    | crontab -

CMD ["/agent/entrypoint.sh"]
