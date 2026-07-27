---
name: completion-gate
description: Use when about to declare work done, fixed, or passing, before committing or opening PRs - demands executing verification commands and reading their output before making any success assertions; evidence precedes claims always.
---

# Completion Gate

## Overview

Declaring work complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence precedes assertions, always.

**No exceptions. No workarounds. No shortcuts.**

## The Prime Directive

```
NO COMPLETION ASSERTIONS WITHOUT FRESH VERIFICATION OUTPUT
```

If the verification command has not been executed in this turn, the assertion cannot be made.

## The Entry Protocol

```
BEFORE asserting any status or expressing confidence:

1. IDENTIFY: Which command substantiates this assertion?
2. EXECUTE: Run the FULL command (fresh, complete) via Bash/PowerShell
3. INSPECT: Read every line of output, check exit code, tally failures
4. CONFIRM: Does the output support the assertion?
   - If NO: Report actual status with evidence
   - If YES: State the assertion WITH supporting evidence
5. ONLY THEN: Make the assertion

Skipping any step = fabrication, not verification
```

## Verification Requirements

| Assertion | Demands | Insufficient |
|-----------|---------|--------------|
| Tests pass | Test runner output showing 0 failures | Prior run, "should pass" |
| Linter clean | Linter output showing 0 errors | Partial scan, extrapolation |
| Build succeeds | Build command with exit code 0 | Linter passing, log fragments |
| Bug resolved | Original symptom tested and passes | Code modified, assumed fixed |
| Dev server boots | Actually started and observed output/screenshot | "Should start fine" |
| `opencode`-delegated task finished | Diff read and reviewed (`git diff`, file re-read) | Trusting opencode's own "done" message |
| Specification met | Line-by-line requirement checklist against the plan | Tests passing alone |

## Guardrails — HALT

- Using hedging language: "should", "probably", "seems to"
- Expressing premature satisfaction ("Done!", "Perfect!", "All good!")
- About to commit/push without verification
- Trusting `opencode`'s self-reported success without reading its diff
- Relying on partial or stale verification
- Thinking "just this one time"

## Cognitive Traps

| Rationalization | Truth |
|-----------------|-------|
| "Should work now" | EXECUTE the verification |
| "I'm confident" | Confidence is not evidence |
| "opencode reported success" | Verify independently — read the diff |
| "Linter passed" | Linter is not the compiler |
| "Partial check is enough" | Partial proof is no proof |

## Verification Patterns

**Tests:**
```
CORRECT: [Run test command] [Output: 34/34 pass] "All tests pass"
WRONG: "Should pass now" / "Looks correct"
```

**Build:**
```
CORRECT: [Run build] [Output: exit 0] "Build passes"
WRONG: "Linter passed" (linter does not validate compilation)
```

**Specification compliance:**
```
CORRECT: Re-read plan -> Create checklist -> Verify each item -> Report gaps or completion
WRONG: "Tests pass, phase done"
```

**opencode delegation (Tessora orchestration):**
```
CORRECT: opencode run reports done -> git diff / re-read changed files -> verify changes match the task -> report actual state
WRONG: Take opencode's stdout summary at face value
```

## Verifying Configuration Changes

Do not merely confirm the operation succeeded. Confirm the output reflects the intended change (the "silent fallback" problem — an operation can succeed using *some* valid config, not the one you intended).

```
BEFORE asserting a configuration change works:

1. IDENTIFY: What should be DIFFERENT after this change?
2. LOCATE: Where is that difference observable?
3. EXECUTE: Command that exposes the observable difference
4. CONFIRM: Output contains the expected difference
5. ONLY THEN: Assert the configuration change works
```

## Verifying UI Work

| Assertion | Demands | Insufficient |
|-----------|---------|--------------|
| Component matches design | Visual comparison (screenshot / browser check) against the design spec | "It looks right to me" |
| Responsive design works | Tested at multiple breakpoints | Desktop-only check |
| Design tokens applied | Spacing/colors/typography match token values | "I used the right classes" |

## When to Apply

**ALWAYS before:**
- Any success or completion claim
- Any expression of satisfaction
- Marking a `TaskUpdate` status as `completed`
- Transitioning to the next task
- Accepting an `opencode`-delegated task as done

## The Bottom Line

```
Execute the command. Read the output. THEN state the result.
```

This is non-negotiable.

## Integration

**Pairs with:**
- `quality-gate` — completion-gate is the evidence discipline; quality-gate is the review step
- `delegated-execution` — apply this before accepting any subagent's or `opencode`'s output as done
- `fault-diagnosis` — Phase 4 verification uses this same evidence-first standard
