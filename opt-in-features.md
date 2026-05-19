# Claude Code Opt-in Features (watchlist)

Features currently OFF or unused. Each is a single config change away — pick one when you want to experiment. Extracted from `CLAUDE.md` 2026-05-19 to keep the always-loaded context lean.

## Settings

- **`skillOverrides` setting** in `settings.json` — values: `off` (default), `user-invocable-only`, `name-only`. Setting to `user-invocable-only` would mean skills fire ONLY on explicit `/command` invocations and never auto-trigger from natural language. Verify the trade-off before flipping — auto-trigger is what makes the web-* skills useful.
- **`worktree.baseRef` setting** — choose whether `isolation: "worktree"` agent calls branch off fresh `main` or current HEAD. Default is HEAD; setting to `main` gives every subagent a clean slate.

## Hooks

- **PreCompact hooks** — block context compaction with exit code 2. Useful for long `/web-evolve` or `/audit` runs where mid-task compaction loses state. Goes in `settings.json` `hooks.PreCompact[]`.
- **Hook `type: "mcp_tool"`** — hooks can directly invoke MCP tools (e.g. fire a Slack notification on Stop hook without writing a wrapper script).

## MCP / Agents

- **MCP `alwaysLoad: true`** — opt a specific MCP server out of tool-search deferral so its tools load immediately. Useful for Supabase / Vercel during active dev. Edit the server entry in `~/.claude.json` or `.mcp.json`.
- **Agent frontmatter `mcpServers:` and `hooks:`** — per-agent MCP/hook configuration. Lets a web agent always have chrome-devtools-mcp without polluting the global enabled list.

## Tools / Commands

- **`PushNotification` tool** — long-running tasks (autopilot, `/web-evolve`, `/full-audit`) can ping when done. Currently a deferred tool — load via ToolSearch when needed.
- **`claude agents` command + Agent view** — centralized session manager (research preview). View all running background sessions in one UI.
- **`/goal` command** — set explicit completion conditions for a session. Claude exits when the goal is met instead of waiting for a Stop signal. Useful inside `/loop`.
