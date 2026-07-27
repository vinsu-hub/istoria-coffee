---
name: fault-diagnosis
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes - root-cause investigation over guessing, especially useful for RAG pipeline bugs (embedding mismatches, chunking edge cases, IPC failures between Tauri and the Python sidecar).
---

# Fault Diagnosis

## Overview

Guessing at fixes wastes time and introduces new defects. Quick patches mask underlying problems.

**Core principle:** ALWAYS identify root cause before attempting any fix. Treating symptoms is failure.

**No exceptions. No workarounds. No shortcuts.**

## The Prime Directive

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

## When to Use

Apply to ANY technical issue: test failures, unexpected behavior, build failures, integration breakdowns — and specifically for Tessora:
- RAG retrieval returning wrong/no results (embedding vs. BM25 mismatch)
- Tauri↔Python sidecar IPC failures
- Ingestion pipeline dropping or mis-chunking documents
- opencode-delegated code that doesn't behave as scaffolded

**Especially important when:**
- "Just one quick fix" seems obvious
- You have already attempted multiple fixes
- A previous fix did not resolve the issue

## The Four Phases

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Thoroughly** — stack traces, line numbers, file paths, error codes. Don't skip past them.
2. **Reproduce Reliably** — exact reproduction steps; if not reproducible, gather more data, don't guess.
3. **Examine Recent Changes** — what changed (recent edits, new dependency, opencode's last delegated diff)?
4. **Gather Evidence in Multi-Component Systems** — Tessora is exactly this shape (Tauri shell → Python sidecar → ChromaDB/SQLite → Groq API). When something fails, instrument each boundary:

   ```
   For EACH component boundary (Tauri->sidecar, sidecar->ChromaDB, sidecar->Groq):
     - Log what data enters the component
     - Log what data exits the component
     - Verify environment/config propagation (e.g. GROQ_API_KEY reaching the sidecar process)

   Run once to collect evidence showing WHERE it breaks
   THEN investigate that specific component
   ```

5. **Trace Data Flow** — where does the bad value originate? What called this function with the bad value? Trace upward until you find the source; fix at the source.

### Phase 2: Pattern Analysis

1. **Locate Working Examples** — find similar working code in the same codebase (see `codebase-research`).
2. **Compare Against References** — if implementing a pattern (e.g. matching the UI Implementation Plan's spec), read it completely, don't skim.
3. **Identify Differences** — list every difference between working and broken, no matter how small.

### Phase 3: Hypothesis and Testing

1. **Form a Single Hypothesis** — "I believe X is the root cause because Y."
2. **Test Minimally** — smallest possible change, one variable at a time.
3. **Verify Before Continuing** — worked? Phase 4. Didn't? New hypothesis, don't pile fixes.
4. **When You Don't Know** — say so. Don't pretend to know.

### Phase 4: Implementation

1. **Create a Failing Test Case** (or minimal repro script if no test framework yet) before fixing.
2. **Implement a Single Fix** — address the root cause, one change at a time.
3. **Verify the Fix** — via `completion-gate` discipline: run it, read the output.
4. **If the Fix Doesn't Work:**
   - Count attempts. If < 3: return to Phase 1 with new information.
   - **If >= 3: STOP and question the architecture.**

5. **If 3+ Fixes Failed: Question Architecture**

   Pattern indicating an architectural problem: each fix reveals new coupling elsewhere, fixes require "massive refactoring," each fix creates new symptoms elsewhere.

   **STOP and discuss with the user before attempting more fixes.** This is not a failed hypothesis — it's a flawed architecture.

## Guardrails — STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "It's probably X, let me fix that" (without having traced it)
- "opencode's diff didn't work, let me just patch it myself" (patch the root cause, don't paper over a bad delegated scaffold)
- "One more fix attempt" (when already tried 2+)

**ALL of these mean: STOP. Return to Phase 1.**

## Cognitive Traps

| Rationalization | What Is Actually True |
|----------------|----------------------|
| "Issue is simple, process not needed" | Simple issues have root causes too. |
| "Multiple fixes at once saves time" | Cannot isolate what worked. Creates new bugs. |
| "I see the problem, let me fix it" | Seeing symptoms is not understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| 1. Root Cause | Read errors, reproduce, check changes, instrument boundaries | Understand WHAT and WHY |
| 2. Pattern | Find working examples, compare | Identify differences |
| 3. Hypothesis | Form theory, test minimally | Confirmed or new hypothesis |
| 4. Implementation | Create test, fix, verify | Bug resolved |

## Integration

**Related skills:**
- `codebase-research` — for Phase 2 pattern comparison
- `completion-gate` — verify fix worked before declaring success
- `environment-awareness` — environment mismatch is a common root cause
