# Aursuq AI Development Rules

You are working on Aursuq, a multi-seller marketplace with Aursuq-operated warehousing and fulfillment.

Before planning, coding, modifying architecture, creating database models, or implementing business logic, always read:

- docs/ai/PROJECT_CONTEXT.md
- docs/ai/DECISIONS.md
- docs/ai/ARCHITECTURE.md
- docs/ai/WORKFLOWS.md
- docs/ai/OPEN_DECISIONS.md
- docs/ai/CURRENT_TASK.md

Also consult the existing repository documentation when relevant:

- README.md
- docs/ARCHITECTURE.md
- docs/MVP.md
- docs/REPO_PLAN.md
- docs/STATUS_ENUMS.md

## Source-of-truth priority

When information conflicts, use this priority:

1. docs/ai/DECISIONS.md
2. docs/ai/PROJECT_CONTEXT.md
3. docs/ai/WORKFLOWS.md
4. docs/ai/ARCHITECTURE.md
5. docs/ai/CURRENT_TASK.md
6. Existing repository documentation
7. Existing implementation

Never silently change an owner-confirmed business decision.

If implementation conflicts with an owner-confirmed decision, stop and report the conflict before redesigning the system.

## Working rules

- Work only on the task defined in CURRENT_TASK.md unless explicitly instructed otherwise.
- Do not invent business requirements.
- Do not add mock/demo business data unless explicitly requested.
- Prefer real-data-ready loading/empty/error states.
- Never commit or push without explicit owner approval.
- Never force-push or rewrite Git history.
- Never expose or commit secrets.
- Use Ubuntu/WSL paths and commands only.
- Run relevant typecheck/build/tests before declaring coding work complete.
- If a command fails, inspect the exact error.
- Do not repeatedly retry the same failed action.
- If two substantially similar attempts fail, stop.
- If you cannot confidently solve a problem, stop and report it.
- Aursuq brand must always remain exactly "Aursuq".
- Arabic and Hebrew are RTL.
- English is LTR.
- Do not use flags for language selection.
- Do not automatically translate names, store names, IDs, product names, or user-generated content.
- Prefer the simplest implementation that supports the MVP and preserves future extensibility.
- Do not introduce microservices, Kubernetes, service meshes, event sourcing, sharding, or other infrastructure unless explicitly required.
- The backend starts as a modular monolith.
- Preserve domain boundaries.
- Never commit API keys, passwords, tokens, .env files, credentials, or personal data.
- Never force-push.
- Never rewrite Git history.
- Never merge to main unless explicitly instructed by the owner.
- Before committing, run relevant lint, typecheck, tests, and build commands.
- Inspect git diff and git status before every commit.
- Keep commits focused on the current task.
- Update docs/ai/CURRENT_TASK.md as meaningful work is completed.
- Update documentation when implementation changes established architecture or workflows.
- Do not remove existing functionality unless the task explicitly requires it.
- Use Linux/WSL commands and relative paths when executing shell commands in this workspace.
- Do not use Windows-style paths such as C:\Users\...

## File Editing Rules

When modifying an existing file:

- Do NOT rewrite the entire file just to change, add, or remove a small part.
- Go directly to the exact section that needs modification.
- Make the smallest safe edit possible.
- Insert, replace, or remove only the necessary lines or blocks.
- Preserve all unrelated code exactly as-is.
- If a new import, function, field, component, translation key, config entry, or small logic block is needed, add only that specific piece.
- Do not regenerate a whole file just because one line or one section needs changing.
- If a large change is genuinely required, split it into targeted edits to the relevant sections and complete all required changes incrementally.

Rewriting an entire existing file is allowed ONLY when:
1. the file is very small, or
2. its structure genuinely requires complete replacement, or
3. targeted edits would be less safe than rewriting it.

Do NOT use large cat/heredoc commands to recreate existing source files for small changes.

Goal:
- minimal diffs
- preserve unrelated code
- lower risk
- fewer timeout errors

## Notification Rules

**SUCCESS RULE:**
A task is considered successfully complete ONLY after:
1. All requested implementation work is finished.
2. All relevant validation/checks are finished.
3. Any errors caused by the task are fixed.
4. Final git status/diff information has been collected when relevant.
5. A SHORT final paragraph (2–4 sentences) is written to `.cline-runtime/final-summary.txt`.

**Cline does NOT send the success email.**

The TaskComplete hook is the ONLY mechanism that sends the final success email:
- Reads `.cline-runtime/final-summary.txt`
- Runs `python3 scripts/cline_notify.py success "<message>"` with the short paragraph
- Prevents duplicate emails via `success_email_sent` flag in state.json

If final-summary.txt is missing/empty, TaskComplete sends fallback:
"Current Aursuq task completed. Detailed summary was not available."

**SUCCESS EMAIL FORMAT (one short paragraph only):**
Briefly state: what task completed, most important change, checks passed/failed, commit/push performed.

Example: "Finished the Owner Dashboard cleanup. All mock business data was removed and the frontend is now prepared for real backend data with empty/loading/error states. Typecheck and build passed successfully. No commit or push was performed."

**BLOCKED RULE:**
If blocked, write a short paragraph to `.cline-runtime/blocker-summary.txt` and send via `blocked-file` BEFORE stopping. Do not wait for TaskComplete.

**STALLED RULE:**
Handled automatically by the background watchdog (after 10 minutes of inactivity).

**CANCELLED RULE:**
Handled automatically by the TaskCancel hook.

**TEST NOTIFICATIONS:**
Use `python3 scripts/cline_notify.py test "message"` (Subject: 🧪 Aursuq Notification Test).