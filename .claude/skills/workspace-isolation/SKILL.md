---
name: workspace-isolation
description: Use when starting feature work that needs isolation from the current workspace, or before executing implementation plans / delegated-execution / team-orchestration tasks - creates an isolated git worktree via the EnterWorktree tool before touching files.
---

# Workspace Isolation

## Overview

This environment has a native `EnterWorktree` tool (deferred — load via `ToolSearch: {"query": "select:EnterWorktree,ExitWorktree"}`) that creates an isolated git worktree in one call. Use it instead of hand-rolling `git worktree add` — it handles directory selection and setup internally.

**Core principle:** Isolation before implementation. No exceptions.

**Announce at start:** "Setting up an isolated workspace before implementation."

## The Prime Directive

> **NO FEATURE WORK ON THE MAIN BRANCH**

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required for:**
- Feature development of any size
- Bug fixes requiring more than a single-line change
- Refactoring work
- Any task from an approved plan (this session or delegated to `opencode`)
- Parallel teammates in a `team-orchestration` setup (each teammate gets its own worktree)

**Not required for:**
- Single-line hotfixes
- Documentation-only changes (e.g. this vault's markdown files)
- Configuration file updates (`.gitignore`, `CLAUDE.md`, skill files)
- Reading or investigating code without making changes

**Note on repos without git initialized:** `D:\tessora` is not currently a git repository. Worktree isolation only applies once it is. Until then, treat "no worktree available" as a signal to confirm scope carefully with the user before broad file changes, not as permission to skip caution.

## Usage

```
ToolSearch: {"query": "select:EnterWorktree,ExitWorktree"}

EnterWorktree: {"name": "<short-branch-name>"}
```

This creates (or reuses) an isolated worktree and switches the working context into it. Run project setup (`npm install`, `pip install -r requirements.txt`, etc. — whatever the project's lockfiles indicate) and confirm a clean baseline (existing tests pass, dev server boots) before starting implementation.

When work is complete and merged, call `ExitWorktree` to return to the main workspace.

## Cognitive Traps

| Rationalization | What Is Actually True |
|----------------|----------------------|
| "It's a small feature, I'll just work on main" | Small features grow. A worktree costs one tool call; untangling work mixed into main costs hours. |
| "Setting up a worktree takes too long" | `EnterWorktree` is a single call. Slower than typing, faster than the mess it prevents. |
| "I'm just prototyping, it doesn't matter" | Prototypes on main become accidental commits. Isolate always. |
| "opencode is just doing a small delegated task" | Delegated work is still work. If `opencode` is editing files, it should be editing them in an isolated worktree too. |

## Guardrails

**Never:**
- Skip worktree setup for multi-file feature work
- Proceed with a broken baseline (failing tests, broken build) without flagging it first
- Assume the worktree is clean — verify with a baseline check after entering

**Always:**
- Call `EnterWorktree` before implementation, not after starting
- Run project setup + a baseline check (tests/build/dev server) immediately after entering
- Call `ExitWorktree` (or hand off to `merge-protocol`-equivalent review) once work is integrated

## Connections

**Required before:**
- `delegated-execution` — set up isolation before dispatching per-task subagents or `opencode`
- `team-orchestration` — each teammate isolates via its own `EnterWorktree` call
- `task-planning` — plans assume an isolated workspace is (or will be) active

**Pairs with:**
- `completion-gate` — verify the baseline inside the worktree before claiming it's ready
