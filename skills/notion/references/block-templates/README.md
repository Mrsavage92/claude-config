# Notion Block Templates

These are pre-validated JSON snippets for the Notion block types this skill uses. The model
assembles pages by combining these templates, NOT by hand-writing block JSON.

Hand-rolled block JSON was the source of the "no callout block type produced" defect — the
model fell back to `quote()` because it couldn't remember the callout block shape correctly.

## How to use

Each template has `REPLACE_*` placeholders. The model reads the template, substitutes the
placeholders for real content, and appends the result to the children array sent via
`notion-call.sh PATCH /v1/blocks/<page-id>/children`.

A typical page body assembly:

```bash
# 1. Read each template
CALLOUT=$(jq '.text = "Welcome to the project"' references/block-templates/callout.json)

# 2. Substitute placeholders with sed or jq
CALLOUT_FILLED=$(jq '.callout.rich_text[0].text.content = "Welcome to the project" | .callout.icon.emoji = "📌"' references/block-templates/callout.json)

# 3. Combine into a children array
jq -n --argjson c "$CALLOUT_FILLED" '{children: [$c]}' > body.json

# 4. POST
bash scripts/notion-call.sh PATCH /v1/blocks/<page-id>/children --children-file body.json
```

For convenience, `scripts/build-blocks.sh` (if present) wraps this pattern.

## Template inventory

| File | Block type | When to use |
|---|---|---|
| `callout.json` | callout | Hero callout at page top, key insights, decisions, warnings (personal docs only — shared docs use quote.json) |
| `heading.json` | heading_1 / heading_2 / heading_3 | Section headings. Replace `REPLACE_LEVEL` with the heading level. Use H2 for top-level sections, H3 for sub-sections. |
| `paragraph.json` | paragraph | Body text |
| `divider.json` | divider | Visual separator between major sections |
| `bulleted_list_item.json` | bulleted_list_item | List of items |
| `to_do.json` | to_do | Checkbox / action item |
| `toggle.json` | toggle | Collapsible detail / supporting info |
| `quote.json` | quote | Important note in shared/internal docs (replaces callout when emoji must be avoided) |
| `code.json` | code | Code snippet. Set language. |

## Block types NOT in this set

If a needed block type isn't here (table, image, embed, etc.), add a new template file rather
than inventing JSON inline. Follow the same `REPLACE_*` placeholder pattern.
