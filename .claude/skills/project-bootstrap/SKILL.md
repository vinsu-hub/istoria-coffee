---
name: project-bootstrap
description: Use when launching a new project, initializing a repository, or scaffolding a codebase from the ground up - directory structure, tooling, linting, testing infrastructure, version control setup. Governs the Tauri+Vite+Python-sidecar scaffold work in Tessora Part B.
---

# Project Bootstrap

## Overview

A properly initialized project prevents most future structural headaches.

**Core principle:** Invest the setup time now, or spend far more unwinding structural debt later.

## The Prime Directive

```
NO FEATURE CODE BEFORE PROJECT STRUCTURE IS ESTABLISHED
```

## When to Use

**Mandatory when:**
- Creating a new project/scaffold from nothing (e.g. Tessora's `src-tauri/`, the rebuilt `frontend/`, the rebuilt `backend/`)
- "Just get something running" (especially then)

## The Entry Protocol

```
BEFORE writing any feature code:

1. STRUCTURE: Is the directory layout established?
2. TOOLING: Are linter, formatter, and type checker wired up?
3. TESTING: Is the test runner configured with a passing placeholder?
4. VERSION CONTROL: Is .gitignore set up? (D:\tessora has no .git yet — confirm with the user whether to init one before scaffolding, since that's a durable structural decision)
5. DEPENDENCIES: Is the package manager initialized with a committed lockfile?

If any answer is NO: fix it first.
```

## Universal Foundation

### 1. Version Control Hygiene

**Mandatory `.gitignore` entries** (per surface being scaffolded):
- `node_modules/`, `dist/`, `build/` (frontend)
- `__pycache__/`, `venv/`, `*.pyc` (Python sidecar)
- `target/` (Rust/Tauri)
- `.env`, `.env.local` (secrets — the Groq API key belongs here, never in source)
- `*.log`, `.DS_Store`, `Thumbs.db`

### 2. Static Analysis and Formatting

| Surface | Linter | Formatter |
|---|---|---|
| Frontend (TS/React) | ESLint | Prettier |
| Python sidecar | Ruff | Ruff |
| Rust/Tauri shell | clippy | rustfmt (built-in) |

**Install on day one** — before the ingestion pipeline or the three-panel shell has any real logic in it.

### 3. Test Infrastructure

| Surface | Framework |
|---|---|
| Frontend | Vitest |
| Python sidecar | pytest |
| Rust/Tauri | built-in `cargo test` |

Write one passing test immediately per surface to confirm the pipeline works before it's actually needed.

### 4. Type Safety

- TypeScript: `strict: true` in `tsconfig.json`, non-negotiable
- Python: type annotations, consider mypy/pyright once the sidecar has real logic

## Directory Structure — Tessora Specifically

Follow the structure already specified in `01 - UI Implementation Plan.md` Section 2 for `frontend/`:

```
frontend/
├── src/
│   ├── components/
│   │   ├── shell/       AppShell, TopBar, Sidebar, LiveWorkspacePanel
│   │   ├── chat/        ChatThread, MessageBubble, CitationChip
│   │   ├── vault/        SourcePreviewCard, DocumentList
│   │   ├── telemetry/    TelemetryPanel, JobLogEntry
│   │   └── graph/        (Phase 3) GraphView, GraphNode
│   ├── styles/            tokens.css / Tailwind config
│   └── App.tsx
├── index.html
├── vite.config.ts
└── package.json
```

For the Python sidecar, mirror the archived module boundaries (`ingestion/`, `retrieval/`, `rag/`) minus the FastAPI transport layer — see `codebase-research` for the porting approach.

## Dependency Governance

```
BEFORE adding any dependency:

1. Is it genuinely necessary?
2. Is it actively maintained?
3. Does it conflict with the "no local LLM inference, Groq-only" architectural constraint?
```

**Always:** commit lockfiles, pin major versions.

## Cognitive Traps

| Rationalization | Truth |
|---|---|
| "It's just a prototype" | Prototypes graduate to production — this scaffold IS the Phase 1 deliverable. |
| "I'll add linting later" | Now is always easier than after the codebase has real content. |
| "I'll organize the files later" | Directory structure is harder to change than code once components exist. |

## Guardrails — HALT and Set Up

- Writing feature components before the three-panel shell scaffold and its design tokens exist
- No `.gitignore` before the first commit (once git is initialized)
- Secrets (Groq API key) anywhere reachable by the frontend/webview

## Integration

- `codebase-research` — when porting archived logic rather than starting from nothing
- `security-protocol` — secrets management and `.gitignore` discipline
- `environment-awareness` — confirms package managers/toolchain before scaffolding
