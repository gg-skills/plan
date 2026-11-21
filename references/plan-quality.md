# Plan Quality and Validation

## Common Misconceptions

| # | Misconception | Correction | Key concept |
|---|---------------|------------|-------------|
| 1 | Plans can start the planned product edit before baseline evidence | Baseline evidence must be collected first. The only earlier edit is the zero-method probe | Evidence-first execution |
| 2 | Sub-agents should own the final plan file by default | Coordinating agent owns the persisted plan; sub-agents draft or review only | Single-threaded default |
| 3 | Text-only descriptions are enough for UI work | A visible UI spec artifact is required before implementation | UI spec gate |
| 4 | Baseline evidence can be a route URL, a chat description, or the name of a tool that was not run | The chosen method must be run, and the screenshot, snapshot, or command transcript must be a local artifact | Artifact resolvability |
| 5 | Runtime-health failures during `npm run local` startup are always terminal | Transient failures during startup are provisional until convergence | Convergence before judgment |
| 6 | A plan is complete when it lists tasks | A complete plan has evidence links, validation gates, and exit criteria for every phase | Plan completeness |
| 7 | All blockers can be resolved before implementation | Some blockers are resolved during execution; document the resolution path, not just the blocker | Live blocker management |
| 8 | Plan sections can be vague if the context is clear | Each section must have explicit scope, success criteria, and dependencies | Explicit over implicit |
| 9 | The plan can be finalized before reviewing prior work | Plans must reference existing studies, decisions, and constraints before drafting | Upstream ingestion |
| 10 | A plan without `CHOOSEABLE_OPTIONS` is acceptable | Every plan closeout must end with `CHOOSEABLE_OPTIONS` | Actionable handoff |
| 11 | One browser or CLI tool is the baseline method | The method is discovered in the project being planned and in the environment executing the plan. No product is the default | Portable baseline methods |
| 12 | An implementation turn can end with a status line and `CHOOSEABLE_OPTIONS` | The ending turn prints the [Implementation Report](../SKILL.md#implementation-report) so the operator can see what changed, how live behavior was proven, what to notice, and how to verify it | Operator implementation report |

## Plan Quality Checklist

Use this checklist before publishing any plan. Each item is a gate — the plan is not complete until all items are satisfied.

| # | Checklist Item | Why It Matters | Gate |
|---|---------------|---------------|------|
| 1 | **Objective clarity** — The plan states a single clear objective and intended outcome in one sentence | Prevents scope creep and misalignment | Pre-draft |
| 2 | **Scope boundaries** — In-scope and out-of-scope items are explicitly listed | Prevents hidden assumptions | Pre-draft |
| 3 | **Upstream ingestion** — Plan references existing study, prior decisions, and constraints | Prevents redundant analysis | Pre-draft |
| 4 | **Phase ordering** — Execution phases are ordered with explicit dependencies between phases | Prevents out-of-order execution | Draft |
| 5 | **Evidence plan** — Each phase has a declared validation surface (browser, runtime, audit) | Ensures evidence-first discipline | Draft |
| 6 | **Baseline capture** — The phase names a runnable baseline method, and the evidence is captured or gated on that method | Required by policy #1. See [Baseline Capture Methods](../SKILL.md#baseline-capture-methods) | Pre-implementation |
| 7 | **Blocker inventory** — All blockers are listed with resolution paths or routing decisions | Prevents stuck execution | Draft |
| 8 | **Artifact linkage** — All supporting artifacts (specs, baseline captures, audits) are linked with local paths | Ensures resumability | Draft |
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
□ Baseline method declared; evidence captured or gated on that method
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

## Plan Consistency Validator

Before publishing a plan, run these consistency checks. A plan that fails any check must be fixed before closeout.

### Consistency Check Matrix

| Check | What to Verify | How to Fix |
|-------|---------------|------------|
| **Scope vs Phases** | Every in-scope item appears in a phase; no out-of-scope item appears | Add missing items or move to out-of-scope |
| **Phase Dependencies** | Earlier phases don't depend on later phases | Reorder phases |
| **Blocker Resolution** | Every blocker has a resolution path or routing decision | Add routing or escalate |
| **Evidence vs Validation** | Every phase's validation surface has corresponding evidence | Capture evidence or gate pending |
| **Baseline method** | A browser or CLI validation surface names a runnable baseline method | Add the Baseline method line from [Baseline Capture Methods](../SKILL.md#baseline-capture-methods) |
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

## Synthetic Validation Scenarios

Before calling the plan contract complete, verify that the updated guidance supports all of these scenarios cleanly:

1. Execution-ready plan with no blockers.
2. Plan with unresolved decisions that should route toward decision resolution.
3. Complex plan that requires automatic detail deepening.
4. Plan with multiple durable artifacts that requires explicit resumability references.
5. Baseline for a project and an execution environment that were not assumed in advance. The plan records only methods that environment can run there, the chosen method, and the local artifacts that method produced.
6. A phase or the plan was fully implemented in this turn. The ending turn prints the Implementation Report: what changed, before and after, live proof with links and images, what to notice, and the steps the operator uses to verify it. The same report is in the plan.
7. A required browser or CLI check has zero runnable methods. The plan runs `instrumentation` on the improve route for the named behavior, then captures with the command it returns. It does not ask the operator to authorize that run. When a method can already run, it captures with that method and may offer `IMPROVE_INSTRUMENTATION` at closeout.
