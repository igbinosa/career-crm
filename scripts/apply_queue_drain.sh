#!/bin/bash
# Auto-apply queue drain - 9am + 6pm PT daily via launchd (com.USER.apply-queue-drain)
export PATH="/Users/USER/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

cd /Users/USER/career-crm || exit 1

/Users/USER/.local/bin/claude -p "Run the auto-apply skill's scheduled drain mode (Intake B): list queued applications via 'npx tsx scripts/queue-cli.ts list-queued', run steps 2-8 of the auto-apply workflow for each against career-crm's Supabase tables instead of job-applications.md, and mark each with 'npx tsx scripts/queue-cli.ts mark <id> <stage>' as it moves through pre-flight/portal/escalation/submit. If the queue is empty, log a one-line no-op and exit." \
  --permission-mode acceptEdits \
  >> /Users/USER/.claude/logs/apply-queue-drain.log 2>&1
