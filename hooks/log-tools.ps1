# log-tools.ps1 -- PostToolUse hook
# Logs every Write and Bash tool call to ~/.claude/tool-use.log
# Registered in settings.json under hooks.PostToolUse

$ErrorActionPreference = 'SilentlyContinue'
try {
    $json = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $ts   = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $tool = $json.tool_name

    $detail = switch ($tool) {
        'Write' { $json.tool_input.file_path }
        'Bash'  {
            $cmd = ($json.tool_input.command -replace "`n", ' ').Trim()
            if ($cmd.Length -gt 120) { $cmd.Substring(0, 120) + '...' } else { $cmd }
        }
        'Edit'  { $json.tool_input.file_path }
        default { '' }
    }

    $logPath = "$env:USERPROFILE\.claude\tool-use.log"
    Add-Content -Path $logPath -Value "$ts  [$tool]  $detail" -Encoding UTF8
} catch {
    # Never crash -- silent exit
}
