---
name: plan
description: when configuring implementation plans from studies, execute with evidence-first quality gates, bridge analysis into deterministic delivery. MCP-compatible. Not for ad-hoc coding.
---

# GG → Plan → Implementation Delivery

> **Snapshot age:** reviewed `2026-04-13` (~20 days old as of today).
> Verify release-sensitive answers with `research-online/SKILL.md` before responding with high confidence.

## Overview

This skill is the execution bridge between analysis and delivery. It connects:

- `study/SKILL.md` (analysis artifacts)
- `decisions/SKILL.md` (blocker resolution)
- `step-by-step/SKILL.md` (manual checklists)
- the `playwright-cli` workflow (browser evidence)
- the `pipeline-auditing` workflow (runtime audit evidence)
- the `profile-generation-audit` workflow (turn-centric audit evidence)
- the `documentation-sync` workflow (doc reconciliation)
- the `agents-sync` workflow (guidance-file reconciliation)
- checkout sync skills: the `workspace-sync-from-origin` workflow,
  the `workspace-publish-to-origin` workflow,
  the `worktrees-update-from-main` workflow,
  the `worktrees-merge-to-main` workflow,
  the `worktrees-align-active-sequential` workflow

The goal is deterministic execution quality regardless of where work starts.

For a direct command lookup, see [Quick Commands](#quick-commands) below.

## When to Use This Skill

**TRIGGER when:**

- User asks to execute a plan end-to-end.
- A study is complete and execution planning or implementation is requested.
- A Codex-session analysis produced execution-ready inventory items.
- A persisted plan artifact exists but lacks deterministic execution sequencing.
- Work requires evidence-first browser validation before implementation.
- Canonical `AGENTS.md` content or `CLAUDE.md` / `GEMINI.md` proxy stubs are modified.

**SKIP when:**

- The task is pure research with no implementation scope (use `research-online/SKILL.md`).
- The task is a single trivial file edit with no plan artifact needed.
- The user explicitly wants only a study, not execution (use `study/SKILL.md`).

## Common Misconceptions

| # | Misconception | Correction | Key concept |
|---|---------------|------------|-------------|
| 1 | Plans can start with code edits before baseline evidence | Baseline evidence must be collected first | Evidence-first execution |
| 2 | Sub-agents should own the final plan file by default | Coordinating agent owns the persisted plan; sub-agents draft or review only | Single-threaded default |
| 3 | Text-only descriptions are enough for UI work | A visible UI spec artifact is required before implementation | UI spec gate |
| 4 | Screenshot evidence can reference route URLs or GitHub metadata | Screenshots must be resolvable local artifact bytes | Artifact resolvability |
| 5 | Runtime-health failures during `npm run local` startup are always terminal | Transient failures during startup are provisional until convergence | Convergence before judgment |
| 6 | A plan is complete when it lists tasks | A complete plan has evidence links, validation gates, and exit criteria for every phase | Plan completeness |
| 7 | All blockers can be resolved before implementation | Some blockers are resolved during execution; document the resolution path, not just the blocker | Live blocker management |
| 8 | Plan sections can be vague if the context is clear | Each section must have explicit scope, success criteria, and dependencies | Explicit over implicit |
| 9 | The plan can be finalized before reviewing prior work | Plans must reference existing studies, decisions, and constraints before drafting | Upstream ingestion |
| 10 | A plan without `CHOOSEABLE_OPTIONS` is acceptable | Every plan closeout must end with `CHOOSEABLE_OPTIONS` | Actionable handoff |

## Quick Commands

```bash
# Publish completed plan artifacts
npx tsx .agents/skills/plan/scripts/finalize-plan-artifacts.ts --plan-dir ".plans/YYYY-MM-DD-task-name-slug"

# Resolve the latest plan folder automatically
npx tsx .agents/skills/plan/scripts/finalize-plan-artifacts.ts --latest

# Dry-run publish
npx tsx .agents/skills/plan/scripts/finalize-plan-artifacts.ts --plan-dir ".plans/YYYY-MM-DD-task-name-slug" --dry-run

# Check plan completeness (15-item checklist + consistency + red flags)
npx tsx .agents/skills/plan/scripts/check-plan-completeness.ts --latest
npx tsx .agents/skills/plan/scripts/check-plan-completeness.ts --plan ".plans/YYYY-MM-DD-slug/plan-slug.md"
npx tsx .agents/skills/plan/scripts/check-plan-completeness.ts --latest --json

# Sync skills after skill-file changes
npm run skills:sync

# Reconcile guidance files after AGENTS.md changes
npm run agents:sync

# After any plan markdown write: generate sibling HTML and print absolute paths
npx tsx .agents/skills/plan/scripts/render-markdown-html.ts --input ".plans/YYYY-MM-DD-slug/plan-slug-YYYY-MM-DD.md"
npx tsx .agents/skills/plan/scripts/render-markdown-html.ts --dir ".plans/YYYY-MM-DD-slug"
```

## Non-Negotiable Policy

1. **Evidence-first.** Baseline evidence must be collected before any code edits; post-implementation evidence is required before closure.
2. **Plan artifact discipline.** Every execution maps to a concrete `.plans/YYYY-MM-DD-task-name-slug/plan-<slug>-YYYY-MM-DD.md` file and stays synchronized with real execution state.
3. **Single-threaded default.** Default to coordinating-agent-owned plan writing; use sub-agents only when the user explicitly requests them, with one bounded drafting lane and narrow reviewer lanes.
4. **UI and browser gates.** UI or page modifications require a visible UI spec artifact before implementation; browser-testable changes require matching baseline and post-implementation screenshot evidence.
5. **Closeout completeness.** Plan closeout must explain the persisted plan, surface pending items and blockers, and end with `CHOOSEABLE_OPTIONS`.
6. **Sync before closure.** Documentation sync and guidance reconciliation (the `agents-sync` workflow) must complete before closure when relevant files changed; skill files changed require `npm run skills:sync`.
7. **Runtime-health gates.** Stop execution and record the plan as blocked when a required dependency is unhealthy; transient startup failures under `npm run local` are provisional until local-edge convergence.
8. **Sanity-check before publish.** Verify the plan has no stale metadata, duplicate blocker wording, or contradictory notes before final messaging.
9. **HTML twin on every markdown write.** After creating or updating any plan markdown file, generate its sibling HTML with `scripts/render-markdown-html.ts` and report the **absolute paths** of the markdown file(s) and the HTML page(s).

## Plan Quality Checklist

Use this checklist before publishing any plan. Each item is a gate — the plan is not complete until all items are satisfied.

| # | Checklist Item | Why It Matters | Gate |
|---|---------------|---------------|------|
| 1 | **Objective clarity** — The plan states a single clear objective and intended outcome in one sentence | Prevents scope creep and misalignment | Pre-draft |
| 2 | **Scope boundaries** — In-scope and out-of-scope items are explicitly listed | Prevents hidden assumptions | Pre-draft |
| 3 | **Upstream ingestion** — Plan references existing study, prior decisions, and constraints | Prevents redundant analysis | Pre-draft |
| 4 | **Phase ordering** — Execution phases are ordered with explicit dependencies between phases | Prevents out-of-order execution | Draft |
| 5 | **Evidence plan** — Each phase has a declared validation surface (browser, runtime, audit) | Ensures evidence-first discipline | Draft |
| 6 | **Baseline capture** — Baseline evidence is captured before any code changes begin | Required by policy #1 | Pre-implementation |
| 7 | **Blocker inventory** — All blockers are listed with resolution paths or routing decisions | Prevents stuck execution | Draft |
| 8 | **Artifact linkage** — All supporting artifacts (specs, screenshots, audits) are linked with local paths | Ensures resumability | Draft |
| 9 | **Exit criteria** — Each phase has explicit success criteria that must pass before proceeding | Provides concrete completion gates | Draft |
| 10 | **Resumability cues** — Plan includes a short "resume cue" telling the next session what to reopen first | Enables session recovery | Closeout |
| 11 | **CHOOSEABLE_OPTIONS** — Plan closeout ends with recommended-first action options | Provides actionable handoff | Closeout |
| 12 | **Sync routing** — Closeout offers relevant workspace/worktree sync based on active checkout | Completes the delivery loop | Closeout |
| 13 | **No contradictions** — Scope, phases, blockers, and options do not contradict each other | Prevents execution confusion | Sanity-check |
| 14 | **No duplicates** — Pending items appear in one visible place, not scattered across sections | Prevents missed work | Sanity-check |
| 15 | **Metadata current** — Plan header has correct date, path, and version | Ensures artifact integrity | Sanity-check |

### Pre-Publish Verification

Before publishing a plan, run through the checklist mentally:

```
□ Objective is clear and singular
□ In-scope / out-of-scope listed
□ Study or "No study" referenced
□ Phases ordered with dependencies noted
□ Each phase has validation surface declared
□ Baseline evidence captured (or gated)
□ Blockers listed with resolution paths
□ Artifacts linked with local paths
□ Exit criteria per phase
□ Resume cue written
□ CHOOSEABLE_OPTIONS present
□ Sync routing offered
□ No contradictions found
□ No duplicate items
□ Metadata current
```

### Quality Tiers

| Tier | Criteria | Use When |
|------|----------|----------|
| **Minimal** | Items 1, 2, 11 | Single-file, no blockers, no evidence needed |
| **Standard** | Items 1-11, 13-15 | Multi-phase, evidence-based, blocker management |
| **Full** | All 15 items | Complex multi-wave, durable artifacts, worktree handoff |

## Plan Anatomy

A complete plan has these sections in order. Adapt the shape to the task, but include all applicable sections.

```markdown
# Plan: [Clear one-sentence objective]
**Path:** `.plans/YYYY-MM-DD-slug/plan-slug-YYYY-MM-DD.md`
**Quality Tier:** [Minimal | Standard | Full]
**Study:** [Path or "No study provided"]

## Objective
One clear sentence describing the intended outcome.

## Scope
- **In-scope:** Explicit list of what will be done
- **Out-of-scope:** Explicit list of what will NOT be done

## Upstream Context
- Study or analysis reference
- Prior decisions affecting execution
- Constraints (deadline, tech stack, etc.)

## Execution Phases
### Phase 1: [Name]
- **Objective:** What this phase accomplishes
- **Steps:** Numbered list of actions
- **Dependencies:** What must be true before this phase
- **Exit Criteria:** What must pass before proceeding
- **Validation Surface:** [browser | runtime | audit | manual]
- **Evidence:** [Baseline captured | Gated pending]

### Phase 2: [Name]
... (same structure)

## Blockers & Risks
| Blocker | Impact | Resolution Path |
|---------|--------|----------------|
| [Blocker] | [Impact] | [Routing or resolution] |

## Artifact Index
| Artifact | Path | Purpose |
|---------|------|--------|
| [Spec] | `.plans/.../spec.md` | UI definition |
| [Screenshot] | `artifacts/baseline/*.png` | Browser evidence |

## Resume Cue
Short paragraph telling the next session what to reopen first.

## CHOOSEABLE_OPTIONS
- `IMPLEMENT_FULL_PLAN` (Recommended): [Action]
- `DEEPEN_PLAN_FIRST`: [Action]
- ...
```

### Section Completeness Rules

| Section | Required For | Why |
|---------|-------------|-----|
| **Objective** | All tiers | Single source of truth for success |
| **Scope** | Standard+ | Prevents scope creep |
| **Upstream Context** | Standard+ | Prevents redundant work |
| **Execution Phases** | Standard+ | Structured execution |
| **Blockers** | Standard+ | Proactive risk management |
| **Artifact Index** | Full | Resumability |
| **Resume Cue** | Full | Session recovery |
| **CHOOSEABLE_OPTIONS** | All tiers | Actionable handoff |

## Plan Consistency Validator

Before publishing a plan, run these consistency checks. A plan that fails any check must be fixed before closeout.

### Consistency Check Matrix

| Check | What to Verify | How to Fix |
|-------|---------------|------------|
| **Scope vs Phases** | Every in-scope item appears in a phase; no out-of-scope item appears | Add missing items or move to out-of-scope |
| **Phase Dependencies** | Earlier phases don't depend on later phases | Reorder phases |
| **Blocker Resolution** | Every blocker has a resolution path or routing decision | Add routing or escalate |
| **Evidence vs Validation** | Every phase's validation surface has corresponding evidence | Capture evidence or gate pending |
| **Artifact vs Content** | Every Artifact Index entry has corresponding content in plan | Link artifact or remove from index |
| **Exit Criteria vs Evidence** | Exit criteria are verifiable by the declared evidence type | Make criteria concrete and evidence-anchored |
| **Objective vs Scope** | Objective can be achieved within in-scope, not out-of-scope | Clarify scope or adjust objective |
| **Upstream vs Scope** | Prior decisions don't contradict in-scope/out-of-scope | Reconcile with upstream |
| **Resume Cue vs Blockers** | Resume cue acknowledges blockers if any are unresolved | Update resume cue |
| **CHOOSEABLE_OPTIONS vs State** | Options match the current execution state and blockers | Add missing options or close resolved blockers |

### Conflict Resolution Priority

When sections contradict, resolve in this order:

1. **Objective** — The objective is supreme; everything else must align
2. **Scope** — Scope boundaries take priority over phase contents
3. **Upstream Decisions** — Prior decisions (from studies, decisions) override local choices
4. **Evidence** — Captured evidence overrides assumptions
5. **Exit Criteria** — Concrete criteria override vague ones

### Red Flags (Never Publish)

A plan with any of these must be fixed before publishing:

- [ ] Phase depends on a later phase's output
- [ ] Blocker listed but no resolution path
- [ ] Evidence declared but no artifact path
- [ ] Exit criterion that cannot be verified
- [ ] Objective achievable only through out-of-scope items
- [ ] Contradictory scope items (X is both in-scope and out-of-scope)

## Plan Generation Prompt Template

Use this template when the user asks to "write a plan" or "create an implementation plan". Fill in each section with specific content.

### Phase 1: Ingest and Orient

```
# Task Analysis

1. What is the objective? (one clear sentence)
2. What study or prior work exists? (path or "No study")
3. What constraints apply? (deadline, tech stack, etc.)
4. What decisions are already made? (from prior decisions)
```

### Phase 2: Scope Definition

```
# Scope

## In-scope
- [ ] 
- [ ] 

## Out-of-scope
- [ ] 
- [ ] 
```

### Phase 3: Phase Decomposition

For each phase, answer:

```
## Phase N: [Name]
- **Objective:** 
- **Steps:**
  1. 
  2. 
- **Dependencies:** 
- **Exit Criteria:** 
- **Validation Surface:** [browser | runtime | audit | manual]
- **Evidence:** [Baseline | Gated]
```

### Phase 4: Blocker Inventory

```
# Blockers & Risks

| Blocker | Impact | Resolution Path |
|---------|--------|----------------|
| | | |
```

### Phase 5: Artifact Assembly

```
# Artifact Index

| Artifact | Path | Purpose |
|---------|------|--------|
| | | |
```

### Phase 6: Final Review

Before publishing, verify:

```
□ Plan Quality Checklist complete (run through all 15 items)
□ Consistency checks passed (run through all 10 checks)
□ No red flags present
□ CHOOSEABLE_OPTIONS written
□ Resume cue written
```

## Pre-Implementation Normalization

All entry paths must satisfy these steps before editing code.

### Automatic Agent Steps

The agent MUST perform these itself. Do NOT present them as user-facing blockers.

1. **Plan artifact readiness.**
   - If no active plan exists, create the `.plans/.../plan-...` artifact before code edits start.
   - If a plan exists, normalize it to the current objective, scope, execution phases, validation surface, and blocker state. After any markdown write, generate sibling HTML.
   - Attach supporting local artifacts (UI specs, screenshots, audit directories) where execution or resumption depends on them.
2. **Study or analysis input is declared.**
   - Source study path exists, or the active plan includes an explicit `No study provided` decision note.
   - A completed the `codex-sessions` workflow improvement inventory may satisfy analysis input when a broader study is not needed.
3. **Documentation update scope is declared up front.**

### Blocking Conditions

These are the ONLY conditions that should stop execution and require user input.

1. For UI/page work, a visible UI spec artifact must exist and be linked from the study or plan.
2. Unresolved execution decisions must be inventoried and resolved through `decisions/SKILL.md`.
3. Runtime-health gate must pass for the declared dependency set before code edits or browser evidence resume.
4. If `npm run local` is the active runtime, the gate must inspect local-edge artifacts before falling back to direct localhost probes.
5. Baseline screenshot evidence must exist for all target browser surfaces when the task touches browser-testable behavior.
6. Baseline evidence rows must resolve to real local screenshot files before any screenshot reference is treated as satisfied.
7. Plan artifact creation or required synchronization could not be completed after automatic normalization was already attempted.
8. Missing validation command results for changed behavior.
9. Guidance files changed but the `agents-sync` workflow reconciliation is missing.
10. During `npm run local` startup, a transient route failure was treated as terminal without checking for later local-edge convergence.

## First-Class Sub-Agent Parallelism

When the active session supports first-class sub-agents:

- Fan out independent read-only discovery, evidence gathering, prompt drafting, and skill-local analysis before shared-file edits begin.
- Keep one coordinating writer or final synthesizer for shared files, decisions, and closeout text.
- Use external `delegate` only when a child slice must cross into another provider or when reproducible `.delegate-sessions/` artifacts are required.

### Planning Mode Decision Guide

| Scenario | Recommended mode |
|----------|-----------------|
| Simple single-artifact plan with no blockers | Single-threaded coordinating agent |
| Study complete, user wants the fastest path | Single-threaded with optional review |
| User explicitly asks for sub-agent help | Bounded drafting lane + narrow reviewer lanes |
| Multi-workstream plan with unresolved unknowns | Auto-deepen before closeout, then sub-agent review |
| Dense branching decisions | Route through `decisions/SKILL.md` first |

**Rule of thumb:** default to single-threaded unless the user explicitly requests sub-agents or the plan complexity demands parallel review.

### Durable Plan Workspace Scaffolding

Before a large plan draft is considered stable, pre-create likely-needed artifact roots when the plan is multi-wave or resumability-heavy:

- `artifacts/baseline/`
- `artifacts/post/`
- `artifacts/runtime-health/`
- `artifacts/review/`
- `artifacts/wave-gates/`
- `artifacts/execution/`

along with placeholder ledgers such as:

- execution / wave-status ledger,
- environment disposition matrix,
- final closure matrix.

## Deterministic Sequence

1. **Ingest context** from the active plan, study, and related execution artifacts.
   - A completed the `codex-sessions` workflow improvement inventory is also valid upstream input.
   - If the work includes UI/page changes, inspect the visible UI spec artifact before writing or executing the plan.
   - When the upstream study is large, distill it into a compact plan brief before wide drafting or review begins.
2. **Ensure plan artifact readiness.**
   - If no active plan exists, create the `.plans/.../plan-...` artifact immediately.
   - When the plan is multi-wave or resumable, create plan-local artifact directories and placeholder ledgers before stabilizing the first draft.
   - If scope, sequencing, validation strategy, or blockers change, patch the persisted plan instead of letting chat-only state drift.
   - Default to coordinating-agent-owned single-threaded first draft unless the user explicitly wants sub-agent-assisted plan generation.
3. **Resolve blocking user choices** with `decisions/SKILL.md`.
   - Prefer the generated decision-page path when the choice set is dense or branching.
4. **Capture baseline evidence** on the primary validation surface.
   - Browser-visible behavior -> the `playwright-cli` workflow
   - Scenario/replay/orchestration/latency/cache/disambiguation -> the `pipeline-auditing` workflow
   - Turn/thread/persistence/reveal/publication-state -> the `profile-generation-audit` workflow
   - For non-trivial audit surfaces, keep one parent orchestrator and fan out bounded read-only audit slices to first-class sub-agents.
5. **Run runtime-health checks** before code edits and again before each evidence phase.
   - When local-edge is active, use local-edge artifacts as the primary health source.
6. **Implement code changes** from plan inventory.
7. **Run targeted tests and parity checks.**
8. **Capture post-implementation evidence** on the same validation surface used for baseline.
9. **Run the `documentation-sync` workflow** and update affected docs.
10. **If guidance files changed, run the `agents-sync` workflow** to reconcile canonical `AGENTS.md` content and proxy stubs.
11. **If skill files changed, run `npm run skills:sync`** and capture command output.
12. **Update the active plan** with before/after evidence and a full implemented-behavior explanation. Regenerate HTML twins for any modified markdown.
13. **Final validation and completion handoff.**
    - Explicitly offer the relevant sync next step:
      - **`CANONICAL_ROOT_WORKSPACE`**: the `workspace-sync-from-origin` workflow and/or the `workspace-publish-to-origin` workflow
      - **`PREPARED_WORKTREE`**: the `worktrees-update-from-main` workflow, the `worktrees-merge-to-main` workflow, and/or the `worktrees-align-active-sequential` workflow
    - Choose the narrowest relevant offer based on the active checkout state.

## Required Plan Closeout Contract

Apply this contract whenever planning creates or materially updates a `.plans/...` artifact.

### Persisted Plan Explanation

The user-facing closeout must summarize:

1. Plan title and the **absolute paths** of the plan markdown file(s) and their HTML twin(s).
2. Objective and intended outcome.
3. In-scope and out-of-scope boundaries.
4. Major workstreams or execution phases.
5. Validation strategy.
6. Pending implementation items, blockers, and open questions.

### Resumability Support

When the plan depends on durable artifacts beyond the plan file itself, expose references explicitly so a later compacted session can recover quickly.

Minimum resumability output:

1. Main study path and relevant appendixes.
2. Prior related plan/study paths when they constrain execution.
3. A short resume cue telling the next session what to reopen first.

### Sanity-Check And Consolidation

Before final publish messaging, verify that:

1. Header metadata is not stale or self-contradictory.
2. Pending items appear in one visible place.
3. Duplicate blocker wording is collapsed.
4. Recommendation, validation, and pending sections do not conflict.

## Default Procedure For Generating Implementation Plans

When the task is "write the implementation plan" from a completed study:

1. **Refresh and normalize.** Reread the study and constraining prior artifacts; confirm worktree/runtime context; list locked decisions, constraints, and required validations.
2. **Distill into a plan brief.** Reduce the study to fixed non-negotiables; separate architecture decisions from still-open execution details.
3. **Create the plan workspace first.** Create the `.plans/...` folder and plan-local artifact directories when multi-wave or long-running.
4. **Draft the first full plan in the coordinating-agent context.** Seed with objective, scope, non-goals, artifact index, wave map, validation gates, blockers, resumability cues, and `CHOOSEABLE_OPTIONS`.
5. **Optionally deepen with sub-agents.** Only when the user explicitly wants them; keep the coordinating agent as final file owner; use narrow reviewer scopes.
6. **Patch incrementally.** Integrate concrete findings that materially improve the plan; keep the artifact internally consistent after each pass.
7. **Run a final consolidation pass.** Remove contradictory wording; collapse duplicate blockers; ensure wave ordering and gate dependencies are sane.
8. **Explain and publish.** Explain the persisted plan in user-facing prose; generate HTML twins for modified markdown; publish the scoped `.plans/...` folder unless the user explicitly asks not to. Report absolute paths to the markdown and HTML files.

### Deepening And Option Selection Matrix

| Scenario | Action |
|----------|--------|
| Simple single-artifact plan, no blockers | Keep concise; offer implementation first |
| Multi-workstream plan, unresolved unknowns, or ambiguous order | Auto-deepen before closeout |
| Blocked plan with unresolved user decisions | Surface blockers; offer decision-resolution options |
| Multi-artifact or long-session plan | Add explicit artifact references and a resume cue |
| Study-ready but no plan yet | Default single-threaded; optionally offer `WRITE_PLAN_WITH_SUBAGENTS` |

### CHOOSEABLE_OPTIONS Contract

Plan closeout must end with a `CHOOSEABLE_OPTIONS` block presented per `chooseable-options/SKILL.md`: printed SCREAMING_SNAKE_CASE tokens **and** the harness Ask User picker when that tool is available.

1. Concise and easy to select in terminal conversation.
2. Adapted to the current scenario.
3. Ordered with the recommended option first.
4. Written as flat bullets: `ACTION_NAME_IN_SCREAMING_SNAKE_CASE`: Description.
5. When recommended, place first and mark `(Recommended)` immediately after the token.
6. Lighter than the full decision packets required by `decisions/SKILL.md`.

Default option families:

1. `IMPLEMENT_FULL_PLAN` (Recommended): Apply the documented file changes and update the plan with execution notes.
2. `CAPTURE_PRE_CHANGE_AUDIT_BASELINE`: Run the selected audit lane before behavior changes when baseline comparison should be preserved.
3. `EXPLAIN_PLAN_VISUALLY`: Produce a concise execution map with phases, dependencies, and blockers.
4. `DEEPEN_PLAN_FIRST`: Expand workstreams into file-by-file edit steps and expected validation output.
5. `REVIEW_PLAN_POINT_BY_POINT`: Walk the plan sections and challenge locked defaults.
6. `RESOLVE_DECISIONS_FIRST`: Route unresolved choices through `decisions/SKILL.md` before implementation.
7. `WRITE_PLAN_SINGLE_THREADED` / `WRITE_PLAN_WITH_SUBAGENTS`: Plan-generation mode selection when no active plan exists yet.
8. `CREATE_SPEC_FOR_FINDING`: Capture out-of-scope issues via `specs/SKILL.md`.

## Example Plan Closeout

Use this as a shape guide, not a fixed template:

```markdown
Plan markdown: `/absolute/path/to/.plans/2026-03-21-example/plan-example-2026-03-21.md`
Plan HTML: `/absolute/path/to/.plans/2026-03-21-example/plan-example-2026-03-21.html`

The plan turns the study into four execution phases: contract patching, audit-skill routing,
validation-surface normalization, and closeout. It keeps runtime implementation changes out of
scope, validates with `npm run skills:sync` plus synthetic scenario checks, and still has two
pending items before code begins: baseline audit capture and a final choice on whether the first
slice should expose an explicit audit-evidence label.

CHOOSEABLE_OPTIONS
- `IMPLEMENT_FULL_PLAN` (Recommended): Apply the documented file changes, run `npm run skills:sync` if skill files changed, and update the plan with execution notes.
- `CAPTURE_PRE_CHANGE_AUDIT_BASELINE`: Run the selected audit lane before the behavior change when the plan is runtime-oriented and a baseline comparison should be preserved.
- `EXPLAIN_PLAN_VISUALLY`: Produce a concise execution map with phases, dependencies, and blockers before implementation starts.
- `DEEPEN_PLAN_FIRST`: Expand the workstreams into file-by-file edit steps and expected validation output before implementation.
- `REVIEW_PLAN_POINT_BY_POINT`: Walk the plan sections and challenge the locked defaults before code changes.
```

Also invoke the harness Ask User picker for these options in the same turn when that tool is available. See `chooseable-options/SKILL.md`.

## Synthetic Validation Scenarios

Before calling the plan contract complete, verify that the updated guidance supports all of these scenarios cleanly:

1. Execution-ready plan with no blockers.
2. Plan with unresolved decisions that should route toward decision resolution.
3. Complex plan that requires automatic detail deepening.
4. Plan with multiple durable artifacts that requires explicit resumability references.

## HANDOFF_OUTPUTS

### To `decisions/SKILL.md`

- Active plan path, study path or `No study provided` note, unresolved decision queue and ordering, current recommendation set and blocking status.

### To `step-by-step/SKILL.md`

- Active plan path, ordered manual-step queue with prerequisites, expected evidence for each user-executed step, current blocker or next-step recommendation.

### To the `playwright-cli` workflow

- Evidence session directory name, exact surface checklist (before/after parity), source routes and expected flash states, exact screenshot artifact filenames and relative evidence paths.

### To the `pipeline-auditing` workflow

- Selected scenario or comparison target, expected baseline/post-change comparison intent, primary runtime question set, whether to run as orchestrator plus bounded first-class sub-agents.

### To the `profile-generation-audit` workflow

- Known pivot IDs (`turnId`, `threadId`, `profileRootId`) when available, expected baseline/post-change comparison intent, primary evidence-plane focus, whether to run as orchestrator plus bounded first-class sub-agents.

### To the `documentation-sync` workflow

- Changed file inventory, behavior deltas and contract updates, documentation targets and class-index update requirements.

### To the `agents-sync` workflow

- Changed guidance file list (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`), expected topic-doc references requiring verification, repositories/submodules touched.

### To `study/SKILL.md`

- Implementation outcomes, deviations from study recommendations, unresolved follow-up questions.

### To `explain/SKILL.md`

- Active plan path, phase breakdown and dependency notes, blockers or pending items, recommended downstream route after explanation.

### To the `codex-sessions` workflow

- Implemented guidance/script/tooling outcomes that originated from session inspection, deviations from the original `IMPROVEMENT_INVENTORY`, validation results.

### To `specs/SKILL.md`

- Discovered issues or opportunities beyond the current plan's scope, evidence sources for Runbook References, observed behavior descriptions for User Journey diagrams, key source files for Key Files tables, priority classification.

## Entry-Point Agnostic Quality Contract

Whether execution starts from `study/SKILL.md` or directly from `plan`, the final output must include:

1. Synchronized plan + companion artifact references.
2. Baseline and post-implementation evidence on the primary validation surface.
3. Browser screenshot parity/accessibility validation outputs when browser-visible behavior is in scope.
4. Audit artifacts and before/after comparison outputs when runtime or turn-centric audit work is in scope.
5. Documentation updates.
6. Traceable commit references.
7. Guidance sync when canonical `AGENTS.md` content or `CLAUDE.md` / `GEMINI.md` proxy stubs were changed.

No fast path may bypass baseline evidence capture or documentation updates.
No fast path may continue after runtime-health degradation; interruption, blocker evidence, and a fresh health pass are required before resuming.

## Troubleshooting

| Symptom | Likely cause and fix | Reference |
|---------|---------------------|-----------|
| Plan artifact drifts out of sync with chat state | Scope or blockers changed but the persisted plan was not patched | Patch the plan when scope, sequencing, or blockers change materially |
| Sub-agent drafting lane stalls | Prompt scope is too broad or the agent is stuck on shared-file edits | Relaunch with narrower scope or switch to draft-content mode |
| Missing baseline screenshot for browser work | Playwright evidence was not captured before code edits | Run the `playwright-cli` workflow before edits |
| Runtime-health gate fails after local-edge restart | Health check was run before services converged | Re-run health check after convergence; do not treat startup transients as terminal |
| Guidance files changed but closure proceeded | Agents-sync step was skipped | Block closure until the `agents-sync` workflow runs |
| Plan closeout lacks actionable next step | CHOOSEABLE_OPTIONS were omitted | Add recommended-first options before final messaging |

## Common Pitfalls

1. **Creating a plan without referencing the source study.** Always link the study path or note `No study provided`.
2. **Letting sub-agents edit the final plan file directly.** Keep the coordinating agent as final owner; sub-agents return drafts for integration.
3. **Skipping UI spec for "small" visual changes.** Any DOM or CSS change needs a spec artifact before implementation.
4. **Using chat-only state instead of the persisted plan.** The `.plans/...` file is the source of truth for execution state.
5. **Forgetting to attach supporting artifacts.** Reference local screenshot, audit, and spec paths inside the plan.
6. **Publishing without offering the relevant sync next step.** Always offer workspace or worktree sync based on the active checkout.
7. **Treating all local-edge startup errors as blocking.** Wait for convergence before judging runtime health.
8. **Publishing a plan without verifying completeness.** Run through the Plan Quality Checklist before publishing.
9. **Writing phases without exit criteria.** Each phase needs concrete success criteria that must pass before proceeding.
10. **Missing artifact links in the Artifact Index.** All screenshots, specs, and audit directories must have local paths in the plan.
11. **Omitting the Resume Cue for multi-session plans.** Without it, the next session wastes time orienting.
12. **Listing blockers without resolution paths.** A blocker without a routing decision blocks execution.
13. **Skipping HTML twins or reporting only relative paths.** After any plan markdown write, generate sibling HTML and give the user absolute paths to both.

## Temporary Files

If this skill needs to create temporary files, place them under `.tmp/plan/YYYY-MM-DD-{subject}`. The root `.tmp/` directory is already gitignored. Do not create top-level dotfile temp directories.
