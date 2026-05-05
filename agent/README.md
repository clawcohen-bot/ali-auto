# NanoClaw Scraper Agent Setup

This folder contains the prompt for a NanoClaw scheduled agent that scrapes AliExpress hourly and syncs car accessory products to the Ali Auto backend.

---

## Prerequisites

- NanoClaw instance is running
- The `ali-auto` API is deployed and reachable at `http://localhost:3000` (or the appropriate host)
- `SYNC_SECRET` is set in the API's environment

---

## Setting Up the Cron Job

You can set up the hourly scraper by asking the NanoClaw agent (in the main group chat):

> "Schedule a task to run every hour that scrapes AliExpress car accessories and syncs them to the backend. Use the prompt in `/workspace/group/ali-auto/agent/scraper-prompt.md`."

NanoClaw will create a cron task with:
- `schedule_type: "cron"`
- `schedule_value: "0 * * * *"` (every hour at minute 0)
- `prompt`: the contents of `scraper-prompt.md`

---

## Manual Setup via MCP Tool

If you prefer to set it up manually, call `mcp__nanoclaw__schedule_task` with:

```json
{
  "schedule_type": "cron",
  "schedule_value": "0 * * * *",
  "prompt": "<paste contents of scraper-prompt.md here>",
  "context_mode": "isolated"
}
```

---

## Environment Variables Required

The API must have these set:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ali_auto
SYNC_SECRET=your_secret_here
PORT=3000
```

The scraper agent reads `SYNC_SECRET` from the environment and passes it as the `x-sync-secret` header when calling `POST /products/sync`.

---

## Monitoring

To check cron task status, ask the agent:
> "List my scheduled tasks"

Or use the `CronList` tool directly.

To pause the scraper:
> "Pause the AliExpress scraper task"

To delete it:
> "Delete the AliExpress scraper cron job"

---

## File Structure

```
agent/
├── scraper-prompt.md   # Full prompt given to the agent each run
└── README.md           # This file
```

---

## How It Works

1. Every hour, NanoClaw wakes the agent with `scraper-prompt.md` as the system prompt.
2. The agent fetches AliExpress search pages using `WebFetch`.
3. It extracts product data (title, price, image, URL, category) from the HTML.
4. Products are normalized to the backend schema and categorized in Hebrew.
5. The agent POSTs the batch to `POST /products/sync` with the sync secret.
6. The backend upserts products using `aliId` as the unique key.
7. The frontend displays the latest products in real time.
