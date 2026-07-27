---
name: quality-gate
description: Use when finishing tasks, shipping significant features, or before landing changes to ensure work meets standards through review - review own diffs, opencode-delegated diffs, and Agent-produced diffs before accepting them as done.
---

# Quality Gate

Review every diff before it's treated as finished — whether it came from this session directly, from a dispatched `Agent`, or from a delegated `opencode run` task.

**Core principle:** Inspect early, inspect often.

## Prime Directive

> **NO LANDING WITHOUT REVIEW**

No exceptions. No workarounds. No shortcuts.

## The Entry Protocol

Before treating a diff as reviewed, confirm:

1. You can see the actual diff (`git diff`, or re-read the changed files if no git repo)
2. You know what was supposed to be built (the plan / task description it should satisfy)
3. You've scoped the review correctly (single task vs. batch)

If any condition is unmet, resolve it before signing off.

## When to Initiate

**Required:**
- After each task in a `delegated-execution` sequence
- After each `opencode run` delegated subtask completes
- After completing a significant feature in this session directly
- Before treating a `TaskUpdate` as `status: completed`

**Discretionary but recommended:**
- When stuck (an outside pass often unblocks)
- After resolving a tricky defect

## How to Review

**1. Get the diff:**

```bash
git diff <BASE_SHA> <HEAD_SHA>
# or, if no git history to diff against:
# re-read the specific files that were supposed to change
```

**2. Review it — either directly, or by dispatching a fresh reviewer:**

For self-reviewed work in this session, read the diff against the spec directly.

For a second opinion, or when reviewing `opencode`-produced output at arm's length, dispatch a subagent via the `Agent` tool (`subagent_type: "claude"` or `"Explore"` for read-only review) with the diff, the spec/task text, and instructions to flag defects rather than restate what changed.

**3. Report findings.** If the `ReportFindings` tool is available for this review, use it — it's built for exactly this (typed, severity-ranked findings). Otherwise report inline:
- Resolve Critical findings immediately
- Resolve Important findings before advancing
- Log Minor findings for a later pass
- Push back with evidence if a finding looks wrong — don't just accept it

## Walkthrough (Tessora example)

```
[opencode run "scaffold the Tauri Rust shell" --dir D:\tessora --auto completes]

You: Initiating quality gate on opencode's output before accepting.

[git diff, or re-read src-tauri/tauri.conf.json, Cargo.toml, src/main.rs]

Findings:
  Important: main.rs spawns the sidecar with a hardcoded path — should use a
             relative path resolved at runtime
  Minor: tauri.conf.json window title doesn't match the "Tessora v1.0.0-beta"
         convention from the UI plan

You: [Re-dispatch opencode with corrective instructions for the Important finding]
[Fix the Minor finding directly — it's a one-line change]
[Re-review]
[Accept as done]
```

## Cognitive Traps

| Rationalization | Truth |
|-----------------|-------|
| "It's a tiny change — no review needed" | Small diffs cause large outages. Review everything. |
| "opencode already tested it" | opencode's self-report is not review. Read the diff yourself. |
| "I'll batch review later" | Quality debt compounds. Review now. |
| "The reviewer won't follow this code" | If a reviewer can't follow it, neither can the next person touching it. |

## Integration

**With `delegated-execution` / `opencode` dispatch:**
- Review after EACH delegated task, whether it went to a subagent or to `opencode`
- Surface defects before they cascade into the next task
- Resolve before starting the next task

**With `completion-gate`:**
- `completion-gate` is the "did you actually run the check" discipline
- `quality-gate` is the "did someone actually look at the diff" discipline
- Both are required, not interchangeable

## Guardrails

**Prohibited:**
- Skipping review because "it's straightforward"
- Ignoring Critical findings
- Advancing with unresolved Important findings
- Accepting an `opencode` diff without reading it

**Mandatory:**
- Review after every delegated task (subagent or `opencode`)
- Resolve Critical findings immediately
- Object with evidence when disputing a finding
