# config-protection - block edits to lint/format/type configs.
#
# Prevents the "silence the error by weakening the check" antipattern. When
# linters complain, the fix is the code, not the config. If you really need
# to edit a config, set env CLAUDE_CONFIG_PROTECT_OFF=1 and retry.
#
# Wired from settings.json as a PreToolUse hook with matcher "Write|Edit|MultiEdit".

$ErrorActionPreference = 'SilentlyContinue'

if ($env:CLAUDE_CONFIG_PROTECT_OFF -eq '1') { exit 0 }

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }

try { $data = $raw | ConvertFrom-Json } catch { exit 0 }

$filePath = $data.tool_input.file_path
$toolName = $data.tool_name
if (-not $filePath) { exit 0 }

$fileName = [System.IO.Path]::GetFileName($filePath).ToLower()

# Exact-match list of lint / format / style configs.
# Deliberately excluded: tsconfig.json, pyproject.toml, package.json - these
# have legitimate non-lint reasons to edit (deps, paths, build targets).
$protected = @(
    '.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.cjs',
    '.eslintrc.yaml', '.eslintrc.yml', '.eslintignore',
    'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts',
    '.prettierrc', '.prettierrc.json', '.prettierrc.js',
    '.prettierrc.yaml', '.prettierrc.yml', '.prettierignore',
    'prettier.config.js', 'prettier.config.mjs', 'prettier.config.cjs',
    '.markdownlint.json', '.markdownlintrc', '.markdownlint.yaml', '.markdownlint.yml',
    'biome.json', '.biome.json', 'biome.jsonc',
    '.stylelintrc', '.stylelintrc.json', '.stylelintrc.js',
    'stylelint.config.js', 'stylelint.config.mjs',
    'ruff.toml', '.ruff.toml',
    '.flake8', '.pylintrc',
    'commitlint.config.js', 'commitlint.config.mjs',
    '.editorconfig'
)

if ($protected -contains $fileName) {
    $msg = @"
config-protection blocked: $toolName on $fileName

Linter / formatter / style configs are protected. If a check is failing, fix
the code - don't weaken the rule. Editing these files almost always means
you're silencing an error instead of understanding it.

If the edit is genuinely legitimate (new rule adoption, team policy change,
config upgrade), set env CLAUDE_CONFIG_PROTECT_OFF=1 and retry.

File: $filePath
"@
    [Console]::Error.WriteLine($msg)
    exit 2
}

exit 0
