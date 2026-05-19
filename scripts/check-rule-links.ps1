# check-rule-links.ps1 -- validates cross-file markdown links inside rules/
# Parses every [text](path) link in rules/**/*.md and asserts the target resolves.
# Ignores http(s) URLs, anchors-only, and mailto.
# Exit 0 = all links resolve. Exit 1 = at least one broken link.

$ErrorActionPreference = 'Stop'

$rulesRoot = Join-Path $PSScriptRoot '..\rules'
if (-not (Test-Path -LiteralPath $rulesRoot)) {
    Write-Host "FAIL: rules/ not found at $rulesRoot" -ForegroundColor Red
    exit 1
}

$broken = New-Object System.Collections.Generic.List[string]
$linksChecked = 0
$linkPattern = '\[(?<text>[^\]]+)\]\((?<href>[^)]+)\)'

$files = Get-ChildItem -Path $rulesRoot -Filter '*.md' -Recurse -File
foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $matches = [regex]::Matches($content, $linkPattern)
    foreach ($m in $matches) {
        $href = $m.Groups['href'].Value.Trim()
        if ($href -match '^(https?:|mailto:|#)') { continue }
        $hrefNoAnchor = ($href -split '#')[0]
        if (-not $hrefNoAnchor) { continue }
        $resolved = Join-Path $file.Directory.FullName $hrefNoAnchor
        $linksChecked++
        if (-not (Test-Path -LiteralPath $resolved)) {
            $rel = Resolve-Path -Relative -LiteralPath $file.FullName
            $broken.Add("$rel -> [$($m.Groups['text'].Value)]($href) -- target missing")
        }
    }
}

Write-Host "Checked $linksChecked relative links across $($files.Count) rule files."
if ($broken.Count -eq 0) {
    Write-Host "PASS: all relative links resolve." -ForegroundColor Green
    exit 0
} else {
    Write-Host "FAIL: $($broken.Count) broken link(s)" -ForegroundColor Red
    foreach ($b in $broken) { Write-Host "  - $b" }
    exit 1
}
