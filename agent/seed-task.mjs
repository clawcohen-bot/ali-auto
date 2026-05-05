/**
 * seed-task.mjs
 *
 * Seeds the hourly AliExpress scraper task into NanoClaw's SQLite database.
 * This runs after init-cli-agent.ts (which runs migrations), so the schema
 * is guaranteed to exist.
 *
 * Idempotent: if a pending task with the same series_id already exists,
 * it updates the prompt in case scraper-prompt.md changed. It never
 * creates duplicate tasks.
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';

// Resolve better-sqlite3 from NanoClaw's node_modules (native module, can't
// be installed twice in different locations on the same platform easily).
const require = createRequire('/nanoclaw/package.json');
const Database = require('better-sqlite3');

// ── Config ─────────────────────────────────────────────────────────────────
const DATA_DIR    = '/nanoclaw/data';
const DB_PATH     = `${DATA_DIR}/v2.db`;
const PROMPT_FILE = '/agent/scraper-prompt.md';
const API_URL     = process.env.API_URL ?? 'http://api:3000';

// Fixed ID so the task is never duplicated across restarts
const TASK_ID = 'ali-auto-scraper-hourly';

// ── Prepare prompt ─────────────────────────────────────────────────────────
const rawPrompt = readFileSync(PROMPT_FILE, 'utf-8');
// Replace the dev placeholder with the real API URL
const prompt = rawPrompt.replaceAll('http://localhost:3000', API_URL);

// ── Open DB ────────────────────────────────────────────────────────────────
const db = new Database(DB_PATH);

// ── Upsert task ────────────────────────────────────────────────────────────
const existing = db.prepare(`
  SELECT id, content
  FROM   messages_in
  WHERE  series_id = ?
    AND  kind      = 'task'
    AND  status    IN ('pending', 'paused')
`).get(TASK_ID);

if (existing) {
  // Update prompt in case the scraper-prompt.md file changed
  const content = JSON.parse(existing.content);
  content.prompt = prompt;
  db.prepare(`UPDATE messages_in SET content = ? WHERE id = ?`)
    .run(JSON.stringify(content), existing.id);
  console.log('[seed-task] Existing scraper task updated with latest prompt.');
} else {
  // Sequence numbers in NanoClaw are always even for host-written rows
  const { maxSeq } = db.prepare(
    'SELECT COALESCE(MAX(seq), -2) AS maxSeq FROM messages_in'
  ).get();
  const seq = maxSeq + 2;

  // Route the task to the CLI agent group that init-cli-agent.ts created
  // (channel_type='cli', platform_id='local', thread_id=NULL)
  db.prepare(`
    INSERT INTO messages_in (
      id, seq, timestamp, status, tries,
      process_after, recurrence, kind,
      platform_id, channel_type, thread_id,
      content, series_id
    ) VALUES (
      ?, ?, datetime('now'), 'pending', 0,
      datetime('now'), '0 * * * *', 'task',
      'local', 'cli', NULL,
      ?, ?
    )
  `).run(
    TASK_ID,
    seq,
    JSON.stringify({ prompt, context_mode: 'isolated' }),
    TASK_ID   // series_id equals the task id for the first occurrence
  );

  console.log('[seed-task] Hourly scraper task created (cron: 0 * * * *).');
}

db.close();
console.log('[seed-task] Done.');
