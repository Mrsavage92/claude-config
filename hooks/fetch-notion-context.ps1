# fetch-notion-context.ps1
# Runs at session start. Fetches all project master docs from Notion and saves to
# ~/.claude/notion-context.md so Claude has live project state without manual steps.

$TOKEN      = $env:NOTION_TOKEN
$PROJECTS_ID = '32a116e8bef281d6bbcae0db73eede0b'
$OUTPUT     = "$env:USERPROFILE\.claude\notion-context.md"
$LOG        = "$env:USERPROFILE\.claude\sync-errors.log"

$HEADERS = @{
    'Authorization'  = "Bearer $TOKEN"
    'Notion-Version' = '2022-06-28'
    'Content-Type'   = 'application/json'
}

function Invoke-Notion([string]$Path) {
    $uri = "https://api.notion.com/v1$Path"
    return Invoke-RestMethod -Uri $uri -Headers $HEADERS -Method GET -ErrorAction Stop
}

function Get-BlockMarkdown($PageId) {
    $lines = [System.Collections.Generic.List[string]]::new()
    $cursor = $null

    do {
        $url = "/blocks/$PageId/children?page_size=100"
        if ($cursor) { $url += "&start_cursor=$cursor" }
        $data = Invoke-Notion $url

        foreach ($b in $data.results) {
            $type = $b.type
            $obj  = $b.$type

            # Extract plain text from rich_text array
            $text = ''
            if ($obj.rich_text) {
                $text = ($obj.rich_text | ForEach-Object {
                    if ($_.type -eq 'text') { $_.text.content } else { '' }
                }) -join ''
            }

            switch ($type) {
                'heading_1'           { $lines.Add("# $text") }
                'heading_2'           { $lines.Add("## $text") }
                'heading_3'           { $lines.Add("### $text") }
                'paragraph'           { if ($text.Trim()) { $lines.Add($text) } }
                'bulleted_list_item'  { $lines.Add("- $text") }
                'numbered_list_item'  { $lines.Add("- $text") }
                'to_do'               {
                    $done = if ($obj.checked) { 'x' } else { ' ' }
                    $lines.Add("- [$done] $text")
                }
                'callout'             { if ($text.Trim()) { $lines.Add("> $text") } }
                'quote'               { if ($text.Trim()) { $lines.Add("> $text") } }
                'divider'             { $lines.Add('---') }
                'table'               {
                    # Skip tables -- too complex for inline markdown in this context
                    $lines.Add("_(table)_")
                }
                'toggle'              { if ($text.Trim()) { $lines.Add("**$text**") } }
                'child_page'          { } # Skip nested child pages
            }
        }

        $cursor = if ($data.has_more) { $data.next_cursor } else { $null }
    } while ($cursor)

    return $lines -join "`n"
}

try {
    if (-not $TOKEN) {
        "[$(Get-Date)] notion-context ERROR: NOTION_TOKEN env var missing" >> $LOG
        exit 0
    }

    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add("# Active Project Context")
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $lines.Add("_Fetched from Notion at session start: $($ts)_")
    $lines.Add("")
    $lines.Add("This file is auto-generated. Read it at the start of any project session for current state.")
    $lines.Add("")
    $lines.Add("---")
    $lines.Add("")

    # Get all project pages under Projects hub
    $projects = Invoke-Notion "/blocks/$PROJECTS_ID/children?page_size=50"
    $found = 0

    foreach ($proj in $projects.results) {
        if ($proj.type -ne 'child_page') { continue }

        $projName = $proj.child_page.title
        $projId   = $proj.id -replace '-', ''

        # Find "Master Doc" child page
        $children = Invoke-Notion "/blocks/$projId/children?page_size=100"
        $masterDoc = $children.results | Where-Object {
            $_.type -eq 'child_page' -and $_.child_page.title -like '*Master Doc*'
        } | Select-Object -First 1

        if ($masterDoc) {
            $docId   = $masterDoc.id -replace '-', ''
            $content = Get-BlockMarkdown $docId

            $lines.Add("## $projName")
            $lines.Add("_Source: https://notion.so/$($docId)_")
            $lines.Add("")
            $lines.Add($content)
            $lines.Add("")
            $lines.Add("---")
            $lines.Add("")
            $found++
        }
    }

    if ($found -eq 0) {
        $lines.Add("_No master docs found in Notion Projects. Run /project-doc to create them._")
    } else {
        $lines.Add("_$found project(s) loaded._")
    }

    $lines -join "`n" | Set-Content -Path $OUTPUT -Encoding UTF8
    "[$(Get-Date)] notion-context: fetched $found projects OK" >> $LOG

} catch {
    "[$(Get-Date)] notion-context ERROR: $_" >> $LOG
    # Don't overwrite existing file on error -- stale is better than empty
}
