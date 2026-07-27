---
name: team-orchestration
description: Use when a task benefits from multiple Agent instances collaborating with peer-to-peer messaging - parallel research, multi-module features, cross-layer changes, or competing hypothesis debugging. Not for simple independent tasks (spawn parallel Agent calls directly) or sequential tasks (use delegated-execution).
---

# Team Orchestration

## Overview

Agent Teams enable multiple sessions to collaborate on a shared project with direct peer-to-peer messaging and shared task lists. Unlike a plain `Agent` dispatch, teammates can message each other, claim tasks dynamically, and coordinate on shared problems.

**Core principle:** Deploy a team when tasks benefit from collaboration, not merely parallelism. If teammates will never need to message each other, dispatch parallel `Agent` calls instead.

## The Prime Directive

```
NO TEAM WITHOUT A COLLABORATION REQUIREMENT
```

If teammates will never exchange messages, you do not need a team.

## When to Use

**Deploy Teams when:**
- Parallel research where discoveries from one investigation redirect another
- Multi-module features where frontend/backend/sidecar must coordinate on an interface (e.g. the Tauri↔Python IPC contract)
- Cross-layer changes requiring interface negotiation
- Debugging with competing hypotheses that need to share evidence

**Do not use when:**
- Simple independent tasks — fan out `Agent` calls directly (single message, multiple tool calls)
- Sequential dependent tasks — use `delegated-execution`
- Fewer than 2 genuinely collaborative task pairs

## Tools

These are deferred tools — load first: `ToolSearch: {"query": "select:SendMessage,TaskCreate,TaskUpdate,TaskList,TaskGet,EnterWorktree"}`. `TeamCreate` may also need loading depending on availability in this environment.

## The Entry Protocol

```
BEFORE forming a team:

1. ENUMERATE: What are all the tasks?
2. MAP: Which tasks need information from other tasks mid-work?
3. COUNT: How many task pairs require shared discoveries?
4. DECIDE:
   - 0 pairs -> parallel Agent calls
   - 1 pair -> consider a single agent or plain subagents
   - 2+ pairs -> Team

Skip a step = unnecessary team overhead, or a team that should have been one
```

## The Workflow

### Step 1: Architect the Team

```json
TeamCreate: { "team_name": "tessora-shell-team", "description": "Coordinate frontend shell + sidecar IPC contract" }

Agent: {
  "name": "frontend-eng",
  "team_name": "tessora-shell-team",
  "prompt": "Own frontend/src/components/shell/. Build AppShell/TopBar/Sidebar/LiveWorkspacePanel per the UI Implementation Plan Section 3. Coordinate with sidecar-eng on the IPC message shape via SendMessage.",
  "description": "Three-panel shell implementation",
  "mode": "bypassPermissions"
}
```

Teammate count: 2 for a clean interface negotiation, 3 max for this project's scope (frontend / sidecar / Tauri glue) — more adds coordination cost without benefit here.

### Step 2: Isolate Workspaces

Each teammate calls `EnterWorktree` at the start of its own work (requires the repo to have git — confirm via `environment-awareness` first; `D:\tessora` doesn't have git yet as of this writing).

### Step 3: Define Tasks with Clear Boundaries

```json
TaskCreate: {
  "subject": "Build three-panel shell",
  "description": "AppShell/TopBar/Sidebar/LiveWorkspacePanel per UI plan Section 3. Files: frontend/src/components/shell/",
  "activeForm": "Building three-panel shell"
}
TaskUpdate: { "taskId": "1", "owner": "frontend-eng" }
```

**File ownership is non-negotiable** — no two teammates edit the same file. If a shared file needs input from multiple perspectives, one teammate owns it and coordinates via `SendMessage`.

### Step 4: Coordinate as Team Lead

- Track completion via `TaskList`
- Relay discoveries: `SendMessage: { "type": "message", "recipient": "sidecar-eng", "content": "...", "summary": "..." }`
- Unblock dependencies: `TaskUpdate: { "taskId": "1", "status": "completed" }`
- Broadcast only for team-wide critical issues (expensive — sends N messages)

### Step 5: Integrate Results

1. Review all changes together for consistency
2. Confirm no file conflicts between teammates
3. Verify cross-module interfaces actually agree (e.g. the IPC message shape both sides assumed)
4. Run `quality-gate` on the combined diff

## Cognitive Traps

| Rationalization | Truth |
|-----------------|-------|
| "Teams are always superior to parallel Agent calls" | Teams add coordination overhead. Deploy only when collaboration is necessary. |
| "More teammates = faster" | More teammates = more coordination. Fewer, focused teammates outperform many scattered ones. |
| "I'll form the team and figure out tasks later" | Tasks MUST be designed before team formation. |
| "Teammates can share files" | Shared files = merge conflicts. Assign clear ownership. |

## Guardrails

**Prohibited:**
- Forming a team for tasks with no collaboration requirement
- Letting teammates edit the same files
- Skipping integration review after completion
- Using broadcast for routine updates

**Mandatory:**
- Clear file ownership boundaries
- Review all changes together after completion
- Run `quality-gate` after integration

## Integration

- `delegated-execution` — for sequential tasks with review checkpoints instead
- `workspace-isolation` — each teammate isolates via `EnterWorktree`
- `quality-gate` — required after team integration
