---
name: codebase-research
description: Use when building ANY feature within an existing project - search the current codebase (via Glob/Grep/Read) for existing patterns, conventions, similar implementations, and established approaches before writing new code.
---

# Codebase Research

## Overview

Before writing new code in an existing project, understand what already exists. The codebase itself is the most authoritative reference for how things should be built.

**Core principle:** Search before coding. Match existing conventions exactly. Never introduce a second way of doing something when a first way already exists.

## The Prime Directive

```
NO NEW CODE WITHOUT UNDERSTANDING THE EXISTING CODE FIRST
```

Found nothing similar after searching? Document what you searched, then establish the convention deliberately.

## When to Use

**Mandatory when:**
- Adding a new feature to an existing codebase
- Creating a new file, component, module, or service
- Porting archived code (e.g. Tessora's old `backend/app/ingestion/`, `retrieval/`, `rag/` modules into the new Python sidecar) — the archived code IS the pattern reference here
- Writing tests for existing functionality

## The Entry Protocol

```
BEFORE writing new code in an existing project:

1. SEARCH (Glob/Grep) -- Query for similar files, functions, patterns, conventions
2. ANALYZE (Read) -- Study how existing code handles the same concerns
3. MATCH -- Align new code with established conventions
4. ONLY THEN -- Begin writing
```

## Search Methodology

| Search Target | Why | How |
|---|---|---|
| Similar files | Find the template to follow | `Glob` for files with similar names/directories |
| Similar functions | Match signatures and patterns | `Grep` for analogous functions |
| Imports and dependencies | Use what the project already uses | `Grep` for import statements |
| Error handling | Match the project's error patterns | `Grep` for try/except, error classes |
| Naming conventions | Use the same casing/terminology | `Read` adjacent files |
| Test patterns | Write tests the way the project does | Find test files for similar modules |

**Structured search sequence:**

```
1. DIRECTORY SCAN (Glob): understand file organization
2. SIMILAR FILE SEARCH (Glob): find the closest existing template
3. PATTERN GREP: confirm the project's approach to that pattern
4. IMPORT ANALYSIS: use existing dependencies rather than new ones
5. TEST FILE REVIEW: match the testing approach
```

**Minimum threshold before writing new code:** Review at least 2 similar files.

## Convention Matching

When the codebase does something one way, do it the same way. Project consistency outweighs individual preference.

| Dimension | Match Exactly |
|---|---|
| Naming | Variable, function, file, class names |
| Structure | File layout, directory organization |
| Patterns | State, errors, async, validation handling |
| Dependencies | Use the project's existing libraries |
| Testing | Test framework, assertion style |

**Signals of established conventions:** linter/formatter config files, shared utility directories (`utils/`, `helpers/`, `lib/`), base classes/interfaces, barrel/index files, test helper directories.

## Tessora-Specific Application

When porting the archived FastAPI backend (`D:\tessora\_archive\backend-fastapi-legacy\app\`) into the new Python sidecar:
1. Read `ingestion/parser.py`, `ingestion/chunker.py`, `retrieval/embedder.py`, `retrieval/search.py` in full before writing the sidecar equivalents
2. Match their function signatures and module structure exactly except where the architecture change (no FastAPI, no Supabase) forces a difference
3. Document explicitly which parts changed and why (transport removed, storage swapped to ChromaDB/SQLite) — this is exactly the "when no precedent exists for the new part" case

## Cognitive Traps

| Rationalization | Truth |
|---|---|
| "My approach is cleaner than what the project uses" | Consistency is worth more than local perfection. |
| "I'll refactor to match my style" | Refactoring is a separate task. Match the existing style now. |
| "The project doesn't have a pattern for this" | Did you search 3+ ways? If truly no precedent, establish one deliberately and document it. |
| "It's just a small utility function" | Small utilities are the most reused code. Getting the pattern wrong affects everything downstream. |

## Guardrails

**Prohibited:**
- Writing new code without searching for similar implementations first
- Introducing a new library when the project already uses an equivalent
- Using a naming convention different from the surrounding code

**Required:**
- Search for at least 2 similar files before writing new code
- Match naming conventions exactly
- Document findings when no precedent exists

## Integration

- `project-bootstrap` — when there's no existing codebase to research (new project)
- `task-planning` — verify conventions before each implementation task
