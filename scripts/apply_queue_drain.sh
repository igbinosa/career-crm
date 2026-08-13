#!/bin/bash
# Auto-apply queue drain - 9am + 6pm PT daily via launchd.
# Paths resolve from $HOME so this file carries no absolute machine paths.
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="${APPLY_DRAIN_LOG:-$HOME/.claude/logs/apply-queue-drain.log}"

cd "$REPO_DIR" || exit 1
mkdir -p "$(dirname "$LOG_FILE")"

claude -p "Run the auto-apply skill's scheduled drain mode (Intake B): list queued applications via 'npx tsx scripts/queue-cli.ts list-queued', run steps 2-8 of the auto-apply workflow for each against career-crm's Supabase tables instead of job-applications.md, and mark each with 'npx tsx scripts/queue-cli.ts mark <id> <stage>' as it moves through pre-flight/portal/escalation/submit. If the queue is empty, log a one-line no-op and exit." \
  --permission-mode acceptEdits \
  >> "$LOG_FILE" 2>&1
