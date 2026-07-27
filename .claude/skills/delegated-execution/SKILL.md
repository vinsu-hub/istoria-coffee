---
name: delegated-execution
description: Use when executing implementation plans with independent tasks in the current session - dispatch a fresh Agent subagent (or opencode, per tessora-dispatch) per task, review after each, before moving to the next.
---

# Delegated Execution

Execute a plan by dispatching one worker per task — either a fresh `Agent` subagent or, for Tessora-specific mechanical scaffolding/porting work, `opencode` (see `tessora-dispatch`) — with review after each.

**Core principle:** Fresh worker per task + review before advancing = high quality, fast iteration.

## When to Use

- Plan exists (from `task-planning` / `ExitPlanMode`)
- Tasks are mostly independent
- Staying in this session (vs. a separate session — not applicable to CLI-based `opencode` dispatch anyway, since that's always a subprocess call)

## The Process

```
1. Read the plan, extract all tasks with full text and context, build a checklist
   (TaskCreate one entry per task if the task list is being tracked)
2. For each task:
   a. Decide: direct (this session), Agent subagent, or opencode dispatch
   b. Dispatch with full task text + context (don't make the worker re-read the plan file)
   c. Worker has questions? Answer them before letting it proceed.
   d. Worker completes -> review the diff (quality-gate)
   e. Issues found -> worker fixes -> re-review -> repeat until clean
   f. Mark task complete (TaskUpdate status: completed) — only after completion-gate verification
3. After all tasks: final review of the whole implementation together
```

## Choosing the Worker

| Task shape | Worker |
|---|---|
| Exploratory, judgment-heavy, small | Direct (this session) |
| Independent, well-specified, needs isolated context | `Agent` subagent |
| Mechanical scaffolding/porting for Tessora specifically | `opencode` via `tessora-dispatch` |

## Example Workflow

```
[Plan has 3 tasks: scaffold Tauri shell, port Python chunker, build AppShell component]

Task 1 (scaffold Tauri shell) -> dispatch via opencode run (tessora-dispatch)
  opencode completes -> review diff (quality-gate) -> Important finding: hardcoded
  path -> re-dispatch with correction -> re-review -> clean -> mark complete

Task 2 (port Python chunker) -> dispatch via opencode run
  ... same review loop ...

Task 3 (AppShell component - core, not delegated per the UI plan's own instruction) ->
  build directly in this session -> self-review against the design tokens -> complete

[All tasks complete] -> final review of the three pieces together, confirm they
integrate (Tauri spawns the sidecar, AppShell renders in the webview)
```

## Advantages

- Fresh context per task — no confusion carried over
- Review checkpoints are systematic, not optional
- Workers can ask questions before/during work rather than silently guessing

## Guardrails

**Never:**
- Skip review (via `quality-gate`) after a delegated task
- Proceed with unresolved Critical/Important findings
- Dispatch multiple workers to the same file/directory concurrently (conflicts)
- Let a worker's self-report substitute for actually reading its diff (`completion-gate`)
- Mark a task complete before verifying it

**If a worker asks questions:** answer clearly, don't rush it into implementation.

**If review finds issues:** same worker (or a corrective re-dispatch) fixes them, re-review, repeat until clean.

## Integration

**Required workflow skills:**
- `workspace-isolation` — set up isolation before starting, when the repo has git
- `task-planning` — produces the plan this skill executes
- `quality-gate` — review template for each task
- `completion-gate` — evidence discipline before marking anything done

**Alternative:**
- `team-orchestration` — when tasks need to *collaborate* mid-work (share discoveries), not just execute independently
