# Plan Handoff Details

## HANDOFF_OUTPUTS

### To `decisions/SKILL.md`

- Active plan path, study path or `No study provided` note, unresolved decision queue and ordering, current recommendation set and blocking status.

### To `step-by-step/SKILL.md`

- Active plan path, ordered manual-step queue with prerequisites, expected evidence for each user-executed step, current blocker or next-step recommendation.

### To the chosen baseline method

- Chosen tool or command, why it can run in this project from this execution environment, the surface or command checklist, the before/after comparison intent, and the local artifact paths under `artifacts/baseline/` and `artifacts/post/`.
- When the chosen method is itself a workflow, also pass the fields that workflow requires.

### To `instrumentation/SKILL.md`

- Route: improve. This handoff is not a verify and not a map.
- The named behavior this phase must observe. Not a bare invocation.
- The question the baseline has to answer from a run.
- That plan will capture with the returned command. No new vendor. No second probe beside a method that can already run.
- Required back: the command and the human path from the report row, proved on one run.

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
