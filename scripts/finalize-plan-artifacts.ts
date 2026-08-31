#!/usr/bin/env -S npx tsx

/**
 * @fileoverview Publishes the latest dated `.plans/` working directory using the shared scoped-artifact finalize flow.
 *
 * Locates `YYYY-MM-DD-*` plan folders, optionally stages git changes, and reuses `publishScopedArtifacts` for consistent handoff.
 *
 * @testing CLI: rerun `npm run file-overview-standards:target-brief -- --file skills/plan/scripts/finalize-plan-artifacts.ts` from the repo root after editing this file.
 * @see scripts/shared/finalize-scoped-artifact.ts - Canonical helpers for resolving repo root and publishing scoped dirs.
 * @documentation reviewed=2026-04-13 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */


import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { getRepoRoot, publishScopedArtifacts } from "../../../scripts/shared/finalize-scoped-artifact";
import { renderMarkdownDirectory } from "./render-markdown-html";

const PLAN_DIRECTORY_PATTERN = /^\d{4}-\d{2}-\d{2}-/;

/**
 * Picks the newest `YYYY-MM-DD-*` plan directory under `.plans/` by sorting names descending.
 *
 * @remarks
 * `I/O:` reads `.plans/` entries synchronously. Chooses the first name after lexicographic sort
 * on folder names, which matches chronological order for ISO date prefixes.
 *
 * @param plansRoot - Absolute filesystem path to the repository `.plans` directory.
 * @returns POSIX path relative to the repo root, starting with `.plans/`.
 * @throws Error when no timestamped plan directories exist.
 */
function resolveLatestPlanDirectory(plansRoot: string): string {
  const entries = fs
    .readdirSync(plansRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && PLAN_DIRECTORY_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left));

  if (entries.length === 0) {
    throw new Error("No timestamped plan directories found under .plans/.");
  }

  return path.join(".plans", entries[0]);
}

/**
 * Resolves the repo-relative plan folder to publish from `--latest`, `--plan-dir`, or `--plan-file`.
 *
 * @remarks
 * `I/O:` synchronously reads the filesystem when validating `--plan-file`. Rejects a plan file whose
 * parent is exactly `.plans/` (artifacts must live one level deeper under a dated folder).
 *
 * @param options - Mutually exclusive resolution modes plus the repository root for path math.
 * @returns POSIX path relative to the repo root pointing at the plan directory.
 * @throws Error when flags are insufficient, the plan file is missing, or layout rules are violated.
 */
function resolvePlanDirectory(options: {
  latest: boolean;
  planDir?: string;
  planFile?: string;
  repoRoot: string;
}): string {
  const plansRoot = path.join(options.repoRoot, ".plans");

  if (options.latest) {
    return resolveLatestPlanDirectory(plansRoot);
  }

  if (typeof options.planDir === "string" && options.planDir.trim().length > 0) {
    const relativePath = path.relative(options.repoRoot, path.resolve(options.repoRoot, options.planDir));
    return relativePath.replace(/\\/g, "/");
  }

  if (typeof options.planFile === "string" && options.planFile.trim().length > 0) {
    const absoluteFilePath = path.resolve(options.repoRoot, options.planFile);
    if (!fs.existsSync(absoluteFilePath) || !fs.statSync(absoluteFilePath).isFile()) {
      throw new Error(`Plan file not found: ${absoluteFilePath}`);
    }

    const planDirectory = path.dirname(absoluteFilePath);
    if (path.resolve(planDirectory) === plansRoot) {
      throw new Error(
        "Plan artifacts must live inside a timestamped .plans/YYYY-MM-DD-<slug>/ folder.",
      );
    }

    return path.relative(options.repoRoot, planDirectory).replace(/\\/g, "/");
  }

  throw new Error("Provide --plan-dir, --plan-file, or use --latest.");
}

/**
 * Ensures the resolved path targets `.plans/YYYY-MM-DD-<slug>/` (timestamped subtree).
 *
 * @remarks
 * `PRE-CONDITION:` caller passes a repo-relative path with forward slashes or normalized separators.
 *
 * @param relativePath - Path under the repo root that should reference a dated plan folder.
 * @throws Error when the path is not under a `YYYY-MM-DD-*` segment inside `.plans/`.
 */
function assertPlanDirectory(relativePath: string): void {
  const normalizedPath = relativePath.replace(/\\/g, "/");
  const segments = normalizedPath.split("/");

  if (segments.length < 2 || segments[0] !== ".plans" || !PLAN_DIRECTORY_PATTERN.test(segments[1] ?? "")) {
    throw new Error(
      "Plan artifacts must be published from .plans/YYYY-MM-DD-<slug>/ timestamped folders.",
    );
  }
}

/**
 * Parses CLI flags, resolves the plan directory, publishes scoped artifacts, and prints JSON.
 *
 * @remarks
 * `I/O:` delegates git staging and publishing to `publishScopedArtifacts`; stdout receives formatted
 * JSON for scripting and handoff. Default commit message is derived from the plan folder basename
 * when `--commit-message` is omitted.
 */
function main(): void {
  const { values } = parseArgs({
    options: {
      "commit-message": { type: "string" },
      "plan-dir": { type: "string" },
      "plan-file": { type: "string" },
      "dry-run": { type: "boolean" },
      latest: { type: "boolean" },
    },
    allowPositionals: false,
  });

  const repoRoot = getRepoRoot(process.cwd());
  const relativePlanDir = resolvePlanDirectory({
    repoRoot,
    latest: values.latest === true,
    planDir: typeof values["plan-dir"] === "string" ? values["plan-dir"] : undefined,
    planFile: typeof values["plan-file"] === "string" ? values["plan-file"] : undefined,
  });

  assertPlanDirectory(relativePlanDir);

  const commitMessage =
    typeof values["commit-message"] === "string" && values["commit-message"].trim().length > 0
      ? values["commit-message"].trim()
      : `docs(plan): publish ${path.basename(relativePlanDir)}`;

  const dryRun = values["dry-run"] === true;
  const htmlResults = dryRun
    ? []
    : renderMarkdownDirectory(path.join(repoRoot, relativePlanDir));

  const result = publishScopedArtifacts({
    repoRoot,
    scopePaths: [relativePlanDir],
    commitMessage,
    dryRun,
  });

  console.log(
    JSON.stringify(
      {
        ...result,
        markdownFiles: htmlResults.map((entry) => entry.markdown),
        htmlFiles: htmlResults.map((entry) => entry.html),
      },
      null,
      2,
    ),
  );
}

main();
