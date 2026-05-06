# Ali-Auto

> **Car accessories from AliExpress — React + NestJS + NanoClaw agent**

Ali-Auto is a full-stack application that automatically scrapes car accessory product listings from AliExpress and displays them in a clean web storefront. A Claude AI agent runs on an hourly schedule, browses AliExpress, extracts product data, and syncs it to the backend — no manual intervention required.

---

## What It Does

1. **Automated scraping** — A [NanoClaw](https://github.com/qwibitai/nanoclaw)-powered Claude AI agent runs every hour, fetches AliExpress search pages across several car accessory categories (lighting, interior, cleaning, safety, multimedia, etc.), and extracts product listings.
2. **Smart extraction** — The agent parses HTML and embedded JSON from AliExpress pages, validates each product (title, price, image, URL, category), deduplicates by `aliId`, and normalizes data for the backend schema.
3. **Live sync** — Validated products are POSTed to the NestJS API (`POST /products/sync`), which upserts records using `aliId` as the unique key.
4. **Web storefront** — A React/Vite frontend (served via Nginx) displays the latest synced products.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Docker Compose                                         │
│                                                         │
│  ┌──────────────┐   HTTP    ┌──────────────────────┐   │
│  │   web (React)│ ────────► │  api (NestJS)        │   │
│  │   Vite+Nginx │           │  Prisma + PostgreSQL  │   │
│  │   port 5555  │           │  port 3000            │   │
│  └──────────────┘           └──────────┬─────────────┘  │
│                                        │ /products/sync  │
│  ┌─────────────────────────────────────▼─────────────┐  │
│  │  agent (NanoClaw daemon)                          │  │
│  │                                                   │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  NanoClaw Scheduler (cron: 0 * * * *)        │ │  │
│  │  │  ↓ every hour                                │ │  │
│  │  │  Claude Code (claude --dangerously-skip-…)   │ │  │
│  │  │  ↓ reads scraper-prompt.md                   │ │  │
│  │  │  WebFetch → AliExpress pages                 │ │  │
│  │  │  Extract + validate products                 │ │  │
│  │  │  POST /products/sync                         │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Tech | Purpose |
|-----------|------|---------|
| `apps/api` | NestJS + Prisma + PostgreSQL | REST API, product upsert, auth via sync secret |
| `apps/web` | React + Vite + Tailwind + Nginx | Product storefront |
| `agent/` | NanoClaw + Claude Code | Hourly scraper agent |

### How the Agent Works

The `agent/` directory contains a self-contained NanoClaw deployment:

- **`Dockerfile`** — Builds a Node 20 Alpine image, clones and compiles NanoClaw from source, then copies the agent files.
- **`entrypoint.sh`** — On startup, runs NanoClaw's DB migrations, registers the `ali-scraper` agent group, writes `agent-claude.md` as the agent's persistent instructions (`CLAUDE.md`), seeds the hourly cron task into the database via `seed-task.mjs`, and finally starts the NanoClaw daemon.
- **`seed-task.mjs`** — Idempotent script that inserts (or updates) a scheduled task in NanoClaw's SQLite database with cron schedule `0 * * * *`. It reads `scraper-prompt.md`, substitutes the actual `API_URL`, and stores the prompt as the task payload.
- **`scraper-prompt.md`** — The full prompt given to Claude each hour: which AliExpress URLs to fetch, how to extract product fields, validation rules, deduplication logic, and how to call the sync API.
- **`agent-claude.md`** — Persistent agent identity/instructions written to `groups/ali-scraper/CLAUDE.md` inside NanoClaw.

---

## Prerequisites

- Docker & Docker Compose
- A PostgreSQL database (can be external or added to compose)
- An [Anthropic API key](https://console.anthropic.com/) (Claude)
- A running [OneCLI](https://github.com/qwibitai/nanoclaw) instance (NanoClaw's container executor)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/clawcohen-bot/ali-auto.git
cd ali-auto
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```env
# PostgreSQL connection string for the API
DATABASE_URL=postgresql://user:password@host:5432/ali_auto

# Shared secret — must match between API and agent
SYNC_SECRET=change_me

# Port for the NestJS API (default 3000)
PORT=3000

# Anthropic API key — passed through to Claude Code containers
ANTHROPIC_API_KEY=sk-ant-...

# OneCLI (NanoClaw container manager) endpoint and key
# Get these from your NanoClaw dashboard
ONECLI_URL=https://your-onecli-instance
ONECLI_API_KEY=your_onecli_key
```

### 3. Start all services

```bash
docker compose up -d
```

This starts:
- `api` — NestJS backend on port 3000
- `web` — React frontend on port **5555**
- `agent` — NanoClaw daemon (no exposed port; communicates internally)

The agent container will automatically:
1. Initialize the NanoClaw database
2. Register the `AliScraper` agent group
3. Seed the hourly scraper task
4. Start the NanoClaw daemon

The first scrape runs at the top of the next hour. You can monitor logs with:

```bash
docker compose logs -f agent
```

---

## How Scheduling Works

NanoClaw stores scheduled tasks in a SQLite database (`/nanoclaw/data/v2.db`). The `seed-task.mjs` script inserts a task with:

```js
{
  id: 'ali-auto-scraper-hourly',
  schedule_type: 'cron',
  schedule_value: '0 * * * *',   // top of every hour
  prompt: '<contents of scraper-prompt.md>',
  context_mode: 'isolated',
  group_jid: '<cli-agent-jid>'
}
```

The task is **idempotent** — re-running `seed-task.mjs` (e.g., on container restart) updates the prompt if it changed, but never creates duplicates.

When the cron fires, NanoClaw spawns a Claude Code process with the scraper prompt. Claude:
1. Fetches AliExpress search pages via `WebFetch`
2. Parses product listings (including JS-embedded JSON in `<script>` tags)
3. Validates each product (non-empty fields, valid URLs, positive prices)
4. Deduplicates by `aliId`
5. POSTs the batch to `POST /products/sync` with the `x-sync-secret` header
6. Logs a summary (fetched / validated / synced counts, category breakdown)

The entire run is expected to complete within ~2 minutes.

---

## Scraped Categories

The agent targets the following AliExpress search categories:

- Car lighting & LED accessories
- Car maintenance tools
- Car multimedia & navigation systems
- Car cleaning & detailing kits
- Car safety & emergency gear
- Car interior accessories & organizers

---

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | **Required.** Claude API key |
| `SYNC_SECRET` | — | **Required.** Shared secret for `/products/sync` auth |
| `DATABASE_URL` | — | **Required.** PostgreSQL connection string |
| `ONECLI_URL` | — | **Required.** OneCLI endpoint for NanoClaw |
| `ONECLI_API_KEY` | — | **Required.** OneCLI authentication key |
| `API_URL` | `http://api:3000` | Internal URL the agent uses to reach the API |
| `PORT` | `3000` | NestJS API listen port |

---

## Project Structure

```
ali-auto/
├── agent/                    # NanoClaw scraper agent
│   ├── Dockerfile            # Agent container image
│   ├── entrypoint.sh         # Startup script
│   ├── seed-task.mjs         # Idempotent cron task seeder
│   ├── scraper-prompt.md     # Claude's hourly instructions
│   ├── agent-claude.md       # Agent identity / CLAUDE.md
│   └── run-scraper.sh        # Manual scraper runner (dev/debug)
├── apps/
│   ├── api/                  # NestJS REST API (Prisma + PostgreSQL)
│   └── web/                  # React + Vite + Tailwind frontend
├── docker-compose.yml        # Orchestrates all three services
├── .env.example              # Environment variable template
└── package.json              # pnpm monorepo root
```

---

## Development

Install dependencies (requires [pnpm](https://pnpm.io/)):

```bash
pnpm install
```

Run API and web in dev mode concurrently:

```bash
pnpm dev
```

To test the scraper manually (without waiting for the cron):

```bash
# Inside the agent container
/agent/run-scraper.sh
```

---

## Built With

- [NanoClaw](https://github.com/qwibitai/nanoclaw) — AI agent daemon with scheduling
- [Claude Code](https://claude.ai/code) — AI that executes the scraping logic
- [NestJS](https://nestjs.com/) — Backend API framework
- [Prisma](https://prisma.io/) — ORM for PostgreSQL
- [React](https://react.dev/) + [Vite](https://vite.dev/) + [Tailwind CSS](https://tailwindcss.com/) — Frontend
- [Docker Compose](https://docs.docker.com/compose/) — Container orchestration
