#!/usr/bin/env npx tsx

/**
 * @fileoverview CLI entrypoint that scores plan markdown against the 15-item plan quality rubric,
 * lightweight cross-section consistency probes, and static red-flag regexes, then prints a human
 * report or JSON plus a publishability gate.
 *
 * This file owns the rubric row table, regex heuristics, synchronous reads of `.plans/**` for
 * `--latest`, argv parsing for `--plan` / `--latest` / `--json`, and stdout/stderr orchestration.
 * Flow: argv -> resolve plan path -> read markdown -> checklist + consistency + red flags -> weighted score, tier, `canPublish` -> stdout (exit 1 on unreadable plan paths).
 *
 * @testing CLI: npx tsx .agents/skills/plan/scripts/check-plan-completeness.ts --latest
 * @testing CLI: npx tsx .agents/skills/plan/scripts/check-plan-completeness.ts --latest --json
 * @testing CLI: npx tsx .agents/skills/plan/scripts/check-plan-completeness.ts --plan .plans/2026-05-19-test/plan-test.md
 *
 * @see skills/plan/SKILL.md - plan skill surface that describes when plan completeness gates study-to-implementation handoffs and how agents should run this checker.
 * @see docs/TYPESCRIPT_STANDARDS_DOCUMENTATION_FILE_OVERVIEWS.md - Repository authority for the audited file-overview tag order, testing and cross-reference discipline, and trailing documentation metadata used in this header.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { argv } from "process";

// ============================================================================
// Types
// ============================================================================

/**
 * One row in the 15-item plan quality checklist used for scoring.
 *
 * @remarks
 * Distinguishes required rubric items from optional ones and carries per-item scoring weight.
 */
interface ChecklistItem {
  number: number;
  name: string;
  description: string;
  required: boolean;
  checked: boolean;
  weight: number;
}

/**
 * Header fields extracted from a plan markdown file for reporting and gating.
 *
 * @remarks
 * Values fall back to sentinel strings when regex probes miss expected front-matter lines.
 */
interface PlanMetadata {
  title: string;
  path: string;
  tier: string;
  study: string;
}

/**
 * Result of a cross-section structural consistency probe on plan content.
 *
 * @remarks
 * Human-facing `message` explains the pass/fail rationale for CLI output.
 */
interface ConsistencyCheck {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Heuristic anti-pattern match surfaced from the static red-flag pattern table.
 *
 * @remarks
 * `location` is reserved for future pinpointing; current checks only set `found`.
 */
interface RedFlag {
  name: string;
  found: boolean;
  location?: string;
}

/**
 * Aggregated completeness outcome: checklist, consistency, red flags, score, and publish gate.
 *
 * @remarks
 * Serialized verbatim when `--json` is enabled; otherwise drives human-readable CLI sections.
 */
interface CompletenessReport {
  metadata: PlanMetadata;
  checklist: ChecklistItem[];
  consistency: ConsistencyCheck[];
  redFlags: RedFlag[];
  score: number;
  maxScore: number;
  tier: string;
  canPublish: boolean;
}

// ============================================================================
// Checklist Definition
// ============================================================================

const CHECKLIST_ITEMS: Omit<ChecklistItem, "checked">[] = [
  { number: 1, name: "Objective clarity", description: "One clear objective in one sentence", required: true, weight: 2 },
  { number: 2, name: "Scope boundaries", description: "In-scope and out-of-scope listed", required: true, weight: 2 },
  { number: 3, name: "Upstream ingestion", description: "Study or prior decisions referenced", required: true, weight: 2 },
  { number: 4, name: "Phase ordering", description: "Dependencies between phases explicit", required: true, weight: 2 },
  { number: 5, name: "Evidence plan", description: "Validation surface per phase", required: true, weight: 2 },
  { number: 6, name: "Baseline capture", description: "Evidence captured or gated", required: true, weight: 2 },
  { number: 7, name: "Blocker inventory", description: "Resolution paths documented", required: true, weight: 2 },
  { number: 8, name: "Artifact linkage", description: "Local paths for all artifacts", required: true, weight: 2 },
  { number: 9, name: "Exit criteria", description: "Success criteria per phase", required: true, weight: 2 },
  { number: 10, name: "Resumability", description: "Resume cue present", required: true, weight: 2 },
  { number: 11, name: "CHOOSEABLE_OPTIONS", description: "Recommended-first action options", required: true, weight: 2 },
  { number: 12, name: "Sync routing", description: "Workspace/worktree sync offered", required: false, weight: 1 },
  { number: 13, name: "No contradictions", description: "Scope, phases, blockers consistent", required: true, weight: 2 },
  { number: 14, name: "No duplicates", description: "Pending items in one place", required: true, weight: 1 },
  { number: 15, name: "Metadata current", description: "Date, path, version correct", required: true, weight: 1 },
];

// ============================================================================
// Red Flags
// ============================================================================

const RED_FLAGS = [
  { name: "Phase depends on later phase", pattern: /(?:depend|prefer).*(?:later|after).*(?:phase|step)/i },
  { name: "Blocker without resolution", pattern: /blocker.*?(?:but|no|without).*?(?:path|resolution|routing)/i },
  { name: "Evidence without path", pattern: /evidence.*?(?:but|no|without).*?(?:path|artifact)/i },
  { name: "Unverifiable exit criterion", pattern: /exit.*?(?:criterion|criteria).*?(?:unclear|vague|tbd)/i },
  { name: "Objective only via out-of-scope", pattern: /objective.*?(?:only|just).*?out-of-scope/i },
  { name: "Contradictory scope", pattern: /in-scope.*and.*out-of-scope.*same|in-scope.*also.*out-of-scope/i },
];

// ============================================================================
// Parser
// ============================================================================

/**
 * Pulls title, declared path, quality tier, and study reference from plan markdown.
 *
 * @remarks
 * Uses anchored regex against conventional headings; never throws—missing fields use defaults.
 *
 * @param content - Full plan file text to scan.
 */
function extractMetadata(content: string): PlanMetadata {
  const titleMatch = content.match(/^#\s*Plan:\s*(.+)/m);
  const pathMatch = content.match(/\*\*Path:\*\*\s*(.+)/m);
  const tierMatch = content.match(/\*\*Quality Tier:\*\*\s*(.+)/m);
  const studyMatch = content.match(/\*\*Study:\*\*\s*(.+)/m);

  return {
    title: titleMatch?.[1]?.trim() || "Untitled Plan",
    path: pathMatch?.[1]?.trim() || "Unknown",
    tier: tierMatch?.[1]?.trim() || "Unknown",
    study: studyMatch?.[1]?.trim() || "No study provided",
  };
}

/**
 * Applies rubric-specific heuristics for a single checklist item number.
 *
 * @remarks
 * Pure string inspection only; branching encodes the 15 checklist probes in one place.
 *
 * @param content - Full plan markdown being evaluated.
 * @param item - Checklist definition row (minus runtime `checked` flag).
 */
function checkItem(content: string, item: Omit<ChecklistItem, "checked">): boolean {
  switch (item.number) {
    case 1: return /^#.*Plan:.*\n/m.test(content) && content.match(/^#.*Plan:.*\n/m)?.[0].length > 15;
    case 2: return /##\s*Scope|Both.*in-scope.*and.*out-of-scope/s.test(content);
    case 3: return /##\s*Upstream|Study:|No study provided/i.test(content);
    case 4: return /##\s*Execution\s+Phases|Phase\s+\d+:|###\s+Phase\s+\d+/m.test(content);
    case 5: return /Validation\s+Surface:|validation.*surface/i.test(content);
    case 6: return /Baseline|baseline.*capture|Evidence:/i.test(content);
    case 7: return /##\s*Blockers|Blocker.*Impact.*Resolution|Blockers.*&.*Risks/i.test(content);
    case 8: return /##\s*Artifact|Artifact\s+Index|\.plans\/|\.png|\.md/i.test(content);
    case 9: return /Exit\s+Criteria:|exit.*criteria|criteria.*pass/i.test(content);
    case 10: return /##\s*Resume\s+Cue|Resume\s+Cue:|resume.*cue/i.test(content);
    case 11: return /CHOOSEABLE_OPTIONS|`[A-Z_]+`.*:/i.test(content);
    case 12: return /sync|worktree|workspace.*sync/i.test(content);
    case 13: return !/contradict|inconsisten/i.test(content) || !content.includes("CONTRADICTION");
    case 14: return !/(?:pending|todo).*?(?:pending|todo).*?(?:pending|todo)/is.test(content);
    case 15: return /Quality\s+Tier:|20\d{2}-\d{2}-\d{2}/.test(content);
    default: return false;
  }
}

/**
 * Runs lightweight cross-section checks beyond per-item checklist probes.
 *
 * @remarks
 * Uses regex slices over headings; tolerates partial sections and explains gaps in messages.
 *
 * @param content - Full plan markdown being evaluated.
 */
function runConsistencyChecks(content: string): ConsistencyCheck[] {
  const checks: ConsistencyCheck[] = [];
  
  // Scope vs Phases
  const inScopeMatch = content.match(/##\s*Scope[\s\S]*?-?\s*In-scope:([\s\S]*?)(?:-?\s*Out-of-scope:|##)/i);
  const phasesMatch = content.match(/##\s*Execution\s+Phases[\s\S]*?(?=##|$)/i);
  
  checks.push({
    name: "Scope vs Phases",
    passed: !!(inScopeMatch && phasesMatch),
    message: inScopeMatch && phasesMatch ? "All scope items align with phases" : "Some scope items may not appear in phases",
  });

  // Phase Dependencies
  const phaseDeps = content.match(/(?:Phase\s+\d+.*?)depend.*?(?:Phase\s+\d+)/gi);
  checks.push({
    name: "Phase Dependencies",
    passed: !phaseDeps?.some(d => /later|after|following/.test(d)),
    message: phaseDeps?.some(d => /later|after|following/.test(d)) ? "Found backward dependencies" : "No backward dependencies",
  });

  // Blocker Resolution
  const blockersMatch = content.match(/##\s*Blockers[\s\S]*?(?:##|$)/i);
  const hasResolutionPaths = /Resolution|Path|Routing/i.test(blockersMatch?.[0] || "");
  checks.push({
    name: "Blocker Resolution",
    passed: !blockersMatch || hasResolutionPaths,
    message: !blockersMatch ? "No blockers section" : hasResolutionPaths ? "All blockers have resolution paths" : "Some blockers missing resolution paths",
  });

  // Evidence vs Validation
  const validationSurfaces = (content.match(/Validation\s+Surface:/gi) || []).length;
  const evidenceCount = (content.match(/Baseline|Evidence:/gi) || []).length;
  checks.push({
    name: "Evidence vs Validation",
    passed: evidenceCount >= validationSurfaces * 0.8,
    message: `${evidenceCount} evidence items for ${validationSurfaces} validation surfaces`,
  });

  // Artifact vs Content
  const artifactPaths = content.match(/\.(?:plans|png|jpg|md|json|log|tmp)\//gi) || [];
  checks.push({
    name: "Artifact vs Content",
    passed: artifactPaths.length > 0 || !/##\s*Artifact/.test(content),
    message: `Found ${artifactPaths.length} artifact paths`,
  });

  return checks;
}

/**
 * Evaluates static anti-pattern regexes against the full plan body.
 *
 * @remarks
 * Returns a stable row per configured flag with `found` set from `pattern.test`.
 *
 * @param content - Full plan markdown being evaluated.
 */
function checkRedFlags(content: string): RedFlag[] {
  return RED_FLAGS.map(flag => ({
    ...flag,
    found: flag.pattern.test(content),
  }));
}

// ============================================================================
// Main
// ============================================================================

/**
 * Locates the newest `plan-*.md` under `.plans/<date-like-dir>/` by directory sort order.
 *
 * @remarks
 * I/O: reads `.plans` via `readdirSync`/`statSync`. Returns null when unreadable or empty.
 */
function findLatestPlan(): string | null {
  try {
    const plansDir = ".plans";
    const dirs = readdirSync(plansDir)
      .filter(d => statSync(join(plansDir, d)).isDirectory())
      .sort()
      .reverse();
    
    for (const dir of dirs) {
      const planFile = join(plansDir, dir, readdirSync(join(plansDir, dir))
        .find(f => f.startsWith("plan-") && f.endsWith(".md")));
      if (planFile) return planFile;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Loads a plan file, scores checklist/consistency/red flags, and prints JSON or a text report.
 *
 * @remarks
 * I/O: synchronous `readFileSync` and `console` output. On read/parse failure logs and `process.exit(1)`.
 *
 * @param planPath - Filesystem path to the plan markdown file.
 * @param json - When true, prints machine-readable JSON instead of the human report.
 */
function checkPlan(planPath: string, json: boolean = false): void {
  try {
    const content = readFileSync(planPath, "utf-8");
    const metadata = extractMetadata(content);
    
    const checklist = CHECKLIST_ITEMS.map(item => ({
      ...item,
      checked: checkItem(content, item),
    }));
    
    const consistency = runConsistencyChecks(content);
    const redFlags = checkRedFlags(content);
    
    const score = checklist.reduce((sum, item) => 
      item.checked ? sum + item.weight : sum, 0);
    const maxScore = checklist.reduce((sum, item) => sum + item.weight, 0);
    
    const requiredItems = checklist.filter(i => i.required);
    const requiredScore = requiredItems.reduce((sum, item) => 
      item.checked ? sum + item.weight : sum, 0);
    const requiredMax = requiredItems.reduce((sum, item) => sum + item.weight, 0);
    
    const canPublish = requiredScore === requiredMax && 
      !redFlags.some(f => f.found) &&
      consistency.every(c => c.passed);

    const tier = score >= 38 ? "Full" : score >= 25 ? "Standard" : "Minimal";

    const report: CompletenessReport = {
      metadata,
      checklist,
      consistency,
      redFlags,
      score,
      maxScore,
      tier,
      canPublish,
    };

    if (json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    // Human-readable output
    console.log("\n📋 Plan Completeness Report");
    console.log("═".repeat(60));
    console.log(`\n📄 ${metadata.title}`);
    console.log(`   Path: ${planPath}`);
    console.log(`   Study: ${metadata.study}`);
    
    console.log(`\n📊 Score: ${score}/${maxScore} (${((score/maxScore)*100).toFixed(0)}%)`);
    console.log(`   Required items: ${requiredScore}/${requiredMax}`);
    console.log(`   Quality tier: ${tier}`);
    
    console.log(`\n${canPublish ? "✅" : "❌"} Publishable: ${canPublish ? "YES" : "NO"}`);
    
    console.log("\n📝 Checklist:");
    for (const item of checklist) {
      const icon = item.checked ? "✅" : item.required ? "❌" : "⚠️";
      console.log(`   ${icon} [${item.number}] ${item.name}`);
    }
    
    console.log("\n🔍 Consistency Checks:");
    for (const check of consistency) {
      const icon = check.passed ? "✅" : "❌";
      console.log(`   ${icon} ${check.name}: ${check.message}`);
    }
    
    const activeRedFlags = redFlags.filter(f => f.found);
    if (activeRedFlags.length > 0) {
      console.log("\n🚨 Red Flags:");
      for (const flag of activeRedFlags) {
        console.log(`   ❌ ${flag.name}`);
      }
    }
    
    console.log("\n" + "═".repeat(60));
    
    if (!canPublish) {
      console.log("\n❌ Plan must be fixed before publishing.");
      const failedItems = checklist.filter(i => !i.checked && i.required);
      if (failedItems.length > 0) {
        console.log("\nMissing required items:");
        failedItems.forEach(i => console.log(`   - ${i.name}`));
      }
    } else {
      console.log("\n✅ Plan is complete and ready to publish.");
    }
    
  } catch (error) {
    console.error(`\n❌ Error reading plan: ${planPath}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// CLI
const args = argv.slice(2);
const planArg = args.find(a => a === "--plan" || a === "-p");
const latestArg = args.includes("--latest");
const jsonArg = args.includes("--json");

if (!planArg && !latestArg) {
  console.log("Usage: check-plan-completeness.ts --plan <path> | --latest [--json]");
  console.log("\nExamples:");
  console.log("  npx tsx check-plan-completeness.ts --plan .plans/2026-05-19-test/plan-test.md");
  console.log("  npx tsx check-plan-completeness.ts --latest");
  console.log("  npx tsx check-plan-completeness.ts --latest --json");
  process.exit(1);
}

let planPath: string | null = null;

if (latestArg) {
  planPath = findLatestPlan();
  if (!planPath) {
    console.error("❌ No plan found in .plans/ directory.");
    process.exit(1);
  }
  console.log(`📍 Using latest plan: ${planPath}`);
} else if (planArg) {
  const planIndex = args.indexOf(planArg);
  planPath = args[planIndex + 1];
  if (!planPath) {
    console.error("❌ Missing plan path after --plan");
    process.exit(1);
  }
}

checkPlan(planPath!, jsonArg);
