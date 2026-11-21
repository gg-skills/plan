# Plan Drafting and Closeout Examples

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
- **Baseline method:** [runnable tool or project command]
- **Evidence:** [local artifact path | Gated]
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
□ Consistency checks passed (run through all 11 checks)
□ No red flags present
□ CHOOSEABLE_OPTIONS written
□ Resume cue written
```

## Example Plan Closeout

Use this as a shape guide for a turn that wrote or updated the plan, not a fixed template. A turn that fully implemented a phase or the plan uses [Implementation Report](../SKILL.md#implementation-report) instead.

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
