---
name: task-planning
description: Use when you have a spec or requirements for a multi-step task, before touching code - produces thorough implementation plans with exact file paths, commands, and verification steps. Complements EnterPlanMode's freeform plan file with stricter granularity discipline.
---

# Task Planning

## Overview

Produce thorough implementation plans written for someone with zero familiarity with the codebase. Spell out everything: exact files to touch per task, exact code, testing procedures, how to verify each step. DRY. YAGNI. Frequent commits.

**Relationship to `EnterPlanMode`:** `EnterPlanMode`/`ExitPlanMode` already gives this environment a plan-mode workflow with an editable plan file. This skill adds the granularity discipline on top — the *content* standard for what a good plan file contains, not a replacement mechanism.

## The Prime Directive

```
NO IMPLEMENTATION WITHOUT A PLAN FIRST
```

## When to Use

**Required:**
- Multi-step features (touching more than one file or behavior)
- Refactoring across module boundaries
- Anything with multiple valid approaches (this is also `EnterPlanMode`'s own trigger criteria)

**Not required:**
- Single-line fixes with obvious scope
- Documentation-only changes

Tempted to think "too simple for a plan"? If it touches more than one file, write the plan.

## The Entry Protocol

Before writing a plan, confirm:

1. **Design is approved** — the user has confirmed the approach (via `AskUserQuestion` or discussion)
2. **Scope is defined** — every component that will change is enumerable
3. **Requirements are concrete** — "done" has acceptance criteria, not feelings
4. **Tech stack is identified**
5. **Test/verification strategy is defined**
6. **Workspace isolation is set up** (`workspace-isolation`) if the repo has git and the change is non-trivial

## Task Granularity

**Each step is one action:**
- "Write the failing test" — step
- "Run it to confirm it fails" — step
- "Implement the minimal code to pass" — step
- "Run the tests to confirm they pass" — step
- "Commit" — step

## Plan Structure

Every plan should include:

```markdown
## Context
[Why this change — the problem/need, what prompted it, intended outcome]

## Task N: [Component Name]
**Files:** exact paths (create/modify/test)
**Steps:** [numbered, each with exact commands and expected output]

## Verification
[Exact commands, run end-to-end, to confirm the whole thing works]
```

## Reminders

- Exact file paths in every step, not "the frontend" or "the backend"
- Complete code/commands in the plan, not "add validation"
- Reference relevant skills by name where applicable (e.g. `codebase-research`, `security-protocol`)
- Note execution mechanism explicitly: does this task get done directly in this session, or dispatched to `opencode` per `tessora-dispatch`? Say so in the plan.

## Execution Handoff (Tessora context)

After a plan is approved (via `ExitPlanMode`), for each task decide:
1. **Direct** — small, exploratory, or judgment-heavy work stays in this session
2. **Delegated to opencode** — mechanical, well-specified scaffolding/porting work, per `tessora-dispatch`
3. **Delegated to a subagent** (`Agent` tool) — parallel research or independent subtasks, per `delegated-execution` / `team-orchestration`

## Cognitive Traps

| Rationalization | What Is Actually True |
|----------------|----------------------|
| "Too simple for a plan" | Simple tasks contain hidden complexity. |
| "I'll figure it out as I go" | That's hacking — you'll miss edge cases and skip verification. |
| "I already know what to do" | Excellent — write it down. If obvious, the plan takes 2 minutes. |

## Integration

- `workspace-isolation` — set up isolation before planning, when applicable
- `delegated-execution` — executes the plan via subagents in this session
- `tessora-dispatch` — executes plan tasks via `opencode` when delegated
- `completion-gate` — verify each plan step, don't assume
