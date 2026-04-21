# Web Hooks (Claude Code PostToolUse patterns)

> Extends [common/patterns.md](../common/patterns.md). Reference only — Adam's hook system is already configured in `~/.claude/settings.json`.

Only wire these if they're not already active. Use project-local tooling — don't pull remote one-offs.

## Format on Save

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm prettier --write \"$FILE_PATH\"",
        "description": "Format edited frontend files"
      }
    ]
  }
}
```

`npm exec prettier --` or `npx prettier --write` work too — prefer repo-owned dependencies.

## Lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm eslint --fix \"$FILE_PATH\"",
        "description": "ESLint on edited frontend files"
      }
    ]
  }
}
```

## Type Check

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm tsc --noEmit --pretty false",
        "description": "Type-check after frontend edits"
      }
    ]
  }
}
```

## CSS Lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "pnpm stylelint --fix \"$FILE_PATH\"",
        "description": "Lint edited stylesheets"
      }
    ]
  }
}
```

## Pre-write File Size Guard

Blocks writes over 800 lines from tool input content (not from disk — file may not exist yet):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const c=i.tool_input?.content||'';const lines=c.split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: File exceeds 800 lines ('+lines+' lines)');process.exit(2)}console.log(d)})\"",
        "description": "Block writes over 800 lines"
      }
    ]
  }
}
```

## Stop — Final Build Verification

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "pnpm build",
        "description": "Verify production build at session end"
      }
    ]
  }
}
```

## Recommended Order

1. Format
2. Lint
3. Type check
4. Build verification
