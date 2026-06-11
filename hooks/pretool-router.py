#!/usr/bin/env python3
"""
PreToolUse router for Mac Claude Code.
Ports three Windows PowerShell hooks to Python:
  - gateguard: block writes to files not Read in this session
  - config-protection: block edits to lint/format configs
  - tokens-lock-enforce: block design token drift when tokens.lock.json exists

Exit 0 = allow. Exit 2 + stderr = block (Claude Code hook contract).
Override env vars: CLAUDE_GATEGUARD_OFF=1, CLAUDE_CONFIG_PROTECT_OFF=1, CLAUDE_TOKENS_LOCK_OFF=1
"""
import json, os, re, sys
from pathlib import Path

def read_stdin():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            sys.exit(0)
        return json.loads(raw)
    except Exception:
        sys.exit(0)

def block(msg):
    print(msg, file=sys.stderr)
    sys.exit(2)

# ── Gateguard ──────────────────────────────────────────────────────────────────
def run_gateguard(data, tool_name, file_path):
    if os.environ.get('CLAUDE_GATEGUARD_OFF') == '1':
        return
    if not file_path:
        return

    session_id = data.get('session_id', 'unknown')
    state_dir = Path.home() / '.claude' / 'hooks' / 'state'
    state_dir.mkdir(parents=True, exist_ok=True)
    state_file = state_dir / f'gateguard-{session_id}.txt'

    try:
        norm = str(Path(file_path).resolve())
    except Exception:
        norm = file_path

    if tool_name == 'Read':
        with open(state_file, 'a') as f:
            f.write(norm + '\n')
        return

    if tool_name in ('Write', 'MultiEdit'):
        if not Path(norm).exists():
            return  # creating new file — always allowed
        seen = set()
        if state_file.exists():
            seen = set(state_file.read_text().splitlines())
        if norm not in seen:
            block(
                f"GateGuard blocked: {tool_name} on a file you haven't Read this session.\n"
                f"File: {norm}\n\n"
                "Read the file first, then retry the write.\n"
                "Override: set env CLAUDE_GATEGUARD_OFF=1"
            )

# ── Config Protection ──────────────────────────────────────────────────────────
PROTECTED_CONFIGS = {
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
    'ruff.toml', '.ruff.toml', '.flake8', '.pylintrc',
    'commitlint.config.js', 'commitlint.config.mjs',
    '.editorconfig',
}

def run_config_protection(tool_name, file_path):
    if os.environ.get('CLAUDE_CONFIG_PROTECT_OFF') == '1':
        return
    if not file_path:
        return
    fname = Path(file_path).name.lower()
    if fname in PROTECTED_CONFIGS:
        block(
            f"config-protection blocked: {tool_name} on {fname}\n\n"
            "Lint/format/style configs are protected. Fix the code, not the config.\n"
            "Override: set env CLAUDE_CONFIG_PROTECT_OFF=1"
        )

# ── Tokens Lock Enforce ────────────────────────────────────────────────────────
TOKEN_BEARING_FILES = {
    'index.css', 'globals.css', 'tailwind.config.ts', 'tailwind.config.js',
    'tailwind.config.mjs', 'tailwind.config.cjs',
}

def find_tokens_lock(start_path):
    d = Path(start_path).parent
    for _ in range(6):
        for rel in ['tokens.lock.json', '.style-mirror/tokens.lock.json']:
            candidate = d / rel
            if candidate.exists():
                return candidate
        parent = d.parent
        if parent == d:
            break
        d = parent
    return None

def run_tokens_lock(tool_name, file_path, content):
    if os.environ.get('CLAUDE_TOKENS_LOCK_OFF') == '1':
        return
    if not file_path or not content:
        return

    p = Path(file_path)
    fname = p.name.lower()
    ext = p.suffix.lower()

    is_token_file = fname in TOKEN_BEARING_FILES
    is_component = ext in ('.tsx', '.jsx') and re.search(r'(?i)components|sections|app|src', file_path)

    if not (is_token_file or is_component):
        return

    lock_path = find_tokens_lock(file_path)
    if not lock_path:
        is_landing = bool(re.search(r'(?i)components[/\\]landing|components[/\\]hero|pages[/\\]Index|pages[/\\]Landing', file_path))
        if is_landing:
            print(f"[tokens-lock-enforce] WARNING: writing to landing component without tokens.lock.json. Run /style-mirror first.", file=sys.stderr)
        return

    try:
        lock = json.loads(lock_path.read_text())
    except Exception:
        return

    sig = lock.get('signature_elements', {})
    mot = lock.get('motion', {})
    violations = []

    if sig and not sig.get('gradient_mesh') and re.search(r'radial-gradient\s*\(\s*at\s+\d', content):
        violations.append('Adds radial-gradient mesh; lock.signature_elements.gradient_mesh = false')

    if sig and not sig.get('glassmorphism') and re.search(r'backdrop-filter\s*:\s*blur|backdrop-blur(-(?:sm|md|lg|xl|2xl|3xl|none))?\b', content):
        violations.append('Adds glassmorphism (backdrop-blur); lock.signature_elements.glassmorphism = false')

    if sig and not sig.get('grain') and re.search(r'feTurbulence|\.grain\s*::?after', content):
        violations.append('Adds grain texture; lock.signature_elements.grain = false')

    if sig and not sig.get('grid_lines') and re.search(r'background-image\s*:\s*linear-gradient\([^)]*1px[^)]*transparent\s*1px', content):
        violations.append('Adds grid-line background; lock.signature_elements.grid_lines = false')

    if sig and not sig.get('gradient_text') and re.search(r'-webkit-background-clip\s*:\s*text|bg-clip-text\b', content):
        violations.append('Adds gradient text; lock.signature_elements.gradient_text = false')

    if mot and not mot.get('hover_scale') and re.search(r'whileHover\s*=\s*\{\{\s*scale\s*:', content):
        violations.append('Adds Framer hover scale; lock.motion.hover_scale = false')

    if mot and not mot.get('fade_up') and re.search(r'\bfadeUp\b|whileInView\s*=\s*"visible"', content):
        violations.append('Adds fadeUp entrance animation; lock.motion.fade_up = false')

    if violations:
        block(
            f"[tokens-lock-enforce] BLOCKED: replication mode active ({lock_path}).\n"
            "Changes diverge from the lock:\n" +
            ''.join(f'  - {v}\n' for v in violations) +
            "\nFix: use values from tokens.lock.json, or set CLAUDE_TOKENS_LOCK_OFF=1"
        )

# ── Router ─────────────────────────────────────────────────────────────────────
def main():
    data = read_stdin()
    tool_name = data.get('tool_name', '')
    tool_input = data.get('tool_input', {})
    file_path = tool_input.get('file_path', '')
    content = tool_input.get('content') or tool_input.get('new_string') or ''

    if tool_name in ('Read', 'Write', 'MultiEdit'):
        run_gateguard(data, tool_name, file_path)

    if tool_name in ('Write', 'Edit', 'MultiEdit'):
        run_config_protection(tool_name, file_path)
        run_tokens_lock(tool_name, file_path, content)

if __name__ == '__main__':
    main()
