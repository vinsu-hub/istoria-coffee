---
name: environment-awareness
description: Use when starting a session on an unfamiliar machine, running shell commands, installing packages, or diagnosing platform-specific failures - detect OS, shell, and toolchain before command execution. On vinsu's machine (Windows 11), this is already known - see Known Environment below.
---

# Environment Awareness

## Overview

The most common agent failure mode: running the wrong shell's syntax, using the wrong package manager, assuming a tool is installed when it isn't.

**Core principle:** DETECT (or, on a known machine, recall) the environment before issuing shell commands.

## Known Environment (vinsu's machine, D:\tessora)

Confirmed, don't re-probe unless something changes:

- **OS:** Windows 11 Pro (win32)
- **Shells available:** PowerShell (primary, via the `PowerShell` tool — Windows PowerShell 5.1, no `&&`/`||`, no ternary) and Bash (via the `Bash` tool — Git Bash / POSIX sh, `/dev/null` works, forward slashes)
- **Do not mix syntax across tools** — a command written for `Bash` (e.g. `find`, `2>/dev/null`) will not work passed to `PowerShell`, and vice versa (`Get-ChildItem`, `$env:VAR`)
- **Coding-agent CLIs installed globally (npm):** `claude` (this session), `opencode` (`opencode-ai`), `pi` (`@earendil-works/pi-coding-agent`). Only `claude` + `opencode` are in scope for Tessora orchestration — see `tessora-dispatch` skill.
- **Package managers seen in D:\tessora:** npm (frontend, `package.json`/`package-lock.json` pattern), pip/requirements.txt (backend, no poetry/uv lockfile currently)
- **D:\tessora is not a git repository** (confirmed) — no `.git` directory. `workspace-isolation`'s `EnterWorktree` tool needs a repo to function; until `git init` happens (with user confirmation — that's a durable structural change), treat multi-file changes with extra care instead of relying on worktree isolation.
- **Obsidian vault at** `D:\tessora\opencode-skills-vault\` — separate from the app repo itself, holds planning docs and both opencode's and Claude Code's skill documentation

## When to Re-Probe

Only re-run detection if:
- Working in a different repo/machine than `D:\tessora`
- A command fails with "not found" / "not recognized" unexpectedly
- The user mentions a new tool or environment change

## Detection Checklist (for unfamiliar environments)

### 1. Operating System
- `win32` = Windows, `darwin` = macOS, `linux` = Linux/WSL

### 2. Shell
**Never assume bash.** Check which tool you're calling through (`Bash` vs `PowerShell` in this environment) — each has its own syntax rules documented in its tool description.

### 3. Package Manager — check lockfiles first

| Lockfile | Manager |
|----------|---------|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `package-lock.json` | npm |
| `poetry.lock` | poetry |
| `uv.lock` | uv |
| `requirements.txt` (no lock) | pip |
| `Cargo.lock` | cargo (relevant once `src-tauri/` exists) |

### 4. Platform-Specific Command Mappings

| Operation | Bash tool | PowerShell tool |
|-----------|-------------|-------------------|
| List files | `ls -la` | `Get-ChildItem` |
| Set env var | `export VAR=val` | `$env:VAR = "val"` |
| Null device | `/dev/null` | `$null` |
| Delete file | `rm file` | `Remove-Item file` |
| Chain unconditional | `A; B` | `A; B` |
| Chain conditional | `A && B` | `A; if ($?) { B }` |

## Cognitive Traps

| Rationalization | What Is Actually True |
|----------------|----------------------|
| "It's probably fine to reuse this Bash snippet in PowerShell" | The two tools in this environment have genuinely different syntax rules — check the tool description before assuming. |
| "npm is the default" | Confirm which package manager the target directory actually uses via its lockfile before running install commands. |
| "D:\tessora has git, I'll just worktree it" | Confirmed: no `.git` present. Verify before relying on `EnterWorktree`. |

## Integration

- `project-bootstrap` — environment detection feeds into new-project setup decisions
- `fault-diagnosis` — environment mismatch is a common root cause of mysterious failures
- `workspace-isolation` — needs a git repo to function; check first
