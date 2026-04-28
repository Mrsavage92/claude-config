# tokens-lock-enforce - block style drift when replication mode is active.
#
# When a project has tokens.lock.json (output of /style-mirror), block writes
# to design-system files that introduce values divergent from the lock —
# specifically Visual Signature Elements that the lock did not capture.
#
# This is the enforcement layer for replication mode. The lock file says
# "the reference doesn't have a gradient mesh"; this hook stops the next
# Write/Edit from sneaking one in.
#
# Wired from settings.json as a PreToolUse hook with matcher "Write|Edit|MultiEdit".
#
# Escape hatch: set env CLAUDE_TOKENS_LOCK_OFF=1 to disable.

$ErrorActionPreference = 'SilentlyContinue'

if ($env:CLAUDE_TOKENS_LOCK_OFF -eq '1') { exit 0 }

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }

try { $data = $raw | ConvertFrom-Json } catch { exit 0 }

$filePath = $data.tool_input.file_path
if (-not $filePath) { exit 0 }

# Only check files that materially carry design tokens or signature elements.
$fileName = [System.IO.Path]::GetFileName($filePath).ToLower()
$ext      = [System.IO.Path]::GetExtension($filePath).ToLower()

$tokenBearing = @(
    'index.css', 'globals.css', 'tailwind.config.ts', 'tailwind.config.js',
    'tailwind.config.mjs', 'tailwind.config.cjs'
)

$isTokenFile = $tokenBearing -contains $fileName
$isComponent = $ext -in @('.tsx', '.jsx') -and ($filePath -match '(?i)components|sections|app|src')
if (-not ($isTokenFile -or $isComponent)) { exit 0 }

# Walk up looking for tokens.lock.json (max 6 levels). Check both
# project-root canonical location and .style-mirror/ archival location.
$dir = [System.IO.Path]::GetDirectoryName($filePath)
$lockPath = $null
for ($i = 0; $i -lt 6; $i++) {
    if (-not $dir) { break }
    foreach ($rel in @('tokens.lock.json', '.style-mirror\tokens.lock.json')) {
        $candidate = Join-Path $dir $rel
        if (Test-Path $candidate) { $lockPath = $candidate; break }
    }
    if ($lockPath) { break }
    $dir = [System.IO.Path]::GetDirectoryName($dir)
}
if (-not $lockPath) { exit 0 }

# Lock found — replication mode active. Read it.
try { $lock = Get-Content -LiteralPath $lockPath -Raw | ConvertFrom-Json } catch { exit 0 }

# Get the content being written.
$content = $data.tool_input.content
if (-not $content) { $content = $data.tool_input.new_string }
if (-not $content) { exit 0 }

# Build the allowed/denied signature element list from the lock.
# Lock schema (per /style-mirror Step 2D): { signature_elements: { gradient_mesh: bool, grain: bool, glow: bool, glassmorphism: bool, grid_lines: bool, gradient_text: bool }, motion: { hover_scale: bool, fade_up: bool, ... } }
$sig = $lock.signature_elements
$mot = $lock.motion

$violations = @()

# Gradient mesh — multi-stop radial-gradient.
if ($sig -and -not $sig.gradient_mesh) {
    $gradientMatches = ([regex]::Matches($content, 'radial-gradient\s*\(\s*at\s+\d')).Count
    if ($gradientMatches -ge 1) {
        $violations += "Adds radial-gradient mesh; lock.signature_elements.gradient_mesh = false"
    }
}

# Glassmorphism — backdrop-filter blur or backdrop-blur-*.
if ($sig -and -not $sig.glassmorphism) {
    if ($content -match 'backdrop-filter\s*:\s*blur' -or $content -match 'backdrop-blur(-(?:sm|md|lg|xl|2xl|3xl|none))?\b') {
        $violations += "Adds glassmorphism (backdrop-blur); lock.signature_elements.glassmorphism = false"
    }
}

# Grain texture — feTurbulence svg pattern or .grain class.
if ($sig -and -not $sig.grain) {
    if ($content -match 'feTurbulence' -or $content -match '\.grain\s*::?after') {
        $violations += "Adds grain texture; lock.signature_elements.grain = false"
    }
}

# Grid lines background.
if ($sig -and -not $sig.grid_lines) {
    if ($content -match 'background-image\s*:\s*linear-gradient\([^)]*1px[^)]*transparent\s*1px') {
        $violations += "Adds grid-line background; lock.signature_elements.grid_lines = false"
    }
}

# Animated gradient text.
if ($sig -and -not $sig.gradient_text) {
    if ($content -match '-webkit-background-clip\s*:\s*text' -or $content -match 'bg-clip-text\b') {
        $violations += "Adds gradient text (background-clip: text); lock.signature_elements.gradient_text = false"
    }
}

# Hover scale — Framer Motion whileHover scale.
if ($mot -and -not $mot.hover_scale) {
    if ($content -match 'whileHover\s*=\s*\{\{\s*scale\s*:') {
        $violations += "Adds Framer hover scale; lock.motion.hover_scale = false"
    }
}

# fadeUp / stagger entrance animations.
if ($mot -and -not $mot.fade_up) {
    if ($content -match '\bfadeUp\b' -or $content -match 'whileInView\s*=\s*"visible"') {
        $violations += "Adds fadeUp entrance animation; lock.motion.fade_up = false"
    }
}

# Font-family override — only flag if the file is a token-bearing file
# (CSS/Tailwind config) and content sets a font-family different from the lock.
if ($isTokenFile -and $lock.typography -and $lock.typography.heading_family) {
    $lockedFont = [string]$lock.typography.heading_family
    $fontMatches = [regex]::Matches($content, "font-family\s*:\s*['""]?([A-Za-z0-9 _\-]+)['""]?")
    foreach ($m in $fontMatches) {
        $writtenFont = $m.Groups[1].Value.Trim()
        if ($writtenFont -and $lockedFont -and $writtenFont -ne $lockedFont -and $writtenFont -notmatch '^(serif|sans-serif|monospace|inherit|system-ui)$') {
            $violations += "Sets font-family '$writtenFont'; lock.typography.heading_family = '$lockedFont'"
            break
        }
    }
}

if ($violations.Count -eq 0) { exit 0 }

# Block the write with stderr message + exit code 2 (per Claude Code hook contract).
$msg  = "[tokens-lock-enforce] BLOCKED: replication mode active (tokens.lock.json found at $lockPath).`n"
$msg += "The following changes diverge from the lock:`n"
foreach ($v in $violations) { $msg += "  - $v`n" }
$msg += "`nFix: read tokens.lock.json and use its values, or set CLAUDE_TOKENS_LOCK_OFF=1 to override."

[Console]::Error.WriteLine($msg)
exit 2
