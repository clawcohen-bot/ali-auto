# NanoClaw Scraper Agent
# Uses NanoClaw (https://github.com/qwibitai/nanoclaw) to run the
# AliExpress car accessories scraper on a recurring hourly schedule.
#
# Required environment variables:
#   ANTHROPIC_API_KEY   — Anthropic API key for Claude
#   SYNC_SECRET         — Must match the backend's SYNC_SECRET
#   API_URL             — Backend URL (default: http://api:3000)
#   ONECLI_URL          — OneCLI service URL (for container management)
#   ONECLI_API_KEY      — OneCLI API key

FROM node:20-alpine

# System dependencies
# python3/make/g++ are required to compile better-sqlite3 (native module)
RUN apk add --no-cache bash curl git python3 make g++

# Install pnpm (matches NanoClaw's packageManager field)
RUN npm install -g pnpm@10.33.0

# Clone NanoClaw from GitHub
RUN git clone --depth 1 https://github.com/qwibitai/nanoclaw /nanoclaw

WORKDIR /nanoclaw

# Install all dependencies (devDeps needed for tsx to run TypeScript scripts)
RUN pnpm install

# Compile TypeScript → dist/
RUN pnpm build

# Create required NanoClaw runtime directories
RUN mkdir -p /nanoclaw/store /nanoclaw/groups /nanoclaw/data

WORKDIR /agent

# Agent-specific files
COPY scraper-prompt.md ./
COPY agent-claude.md ./
COPY seed-task.mjs ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

CMD ["/agent/entrypoint.sh"]
