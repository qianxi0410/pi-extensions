#!/usr/bin/env node
/**
 * Move the root package and every `packages/*` package to one version, in
 * lockstep. Packages are published together, so their versions never drift.
 *
 * Usage:
 *   pnpm version:set patch
 *   pnpm version:set minor
 *   pnpm version:set major
 *   pnpm version:set 1.2.3
 *
 * This does not create a git commit or tag. Commit and tag afterwards.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * @param {string} current
 * @param {string} bump
 * @returns {string}
 */
function nextVersion(current, bump) {
  const explicit = SEMVER.exec(bump);
  if (explicit) {
    return `${explicit[1]}.${explicit[2]}.${explicit[3]}`;
  }

  const match = SEMVER.exec(current);
  if (!match) {
    throw new Error(`Current version "${current}" is not a plain semver.`);
  }

  let [, major, minor, patch] = match;
  switch (bump) {
    case "major":
      major = String(Number(major) + 1);
      minor = "0";
      patch = "0";
      break;
    case "minor":
      minor = String(Number(minor) + 1);
      patch = "0";
      break;
    case "patch":
      patch = String(Number(patch) + 1);
      break;
    default:
      throw new Error(`Unknown bump "${bump}". Use patch, minor, major, or an exact x.y.z.`);
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * @param {string} file
 * @param {string} version
 */
async function writeVersion(file, version) {
  const raw = await readFile(file, "utf8");
  const indent = raw.match(/\n([ \t]+)"/)?.[1] ?? "  ";
  const pkg = JSON.parse(raw);
  pkg.version = version;
  await writeFile(file, `${JSON.stringify(pkg, null, indent)}\n`);
}

async function main() {
  const bump = process.argv[2];
  if (!bump) {
    console.error("Usage: pnpm version:set <patch|minor|major|x.y.z>");
    process.exit(1);
  }

  const rootFile = join(ROOT, "package.json");
  const root = JSON.parse(await readFile(rootFile, "utf8"));
  const next = nextVersion(root.version, bump);

  await writeVersion(rootFile, next);
  console.log(`  package.json -> ${next}`);

  const packagesDir = join(ROOT, "packages");
  const entries = await readdir(packagesDir, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = join(packagesDir, entry.name, "package.json");
    try {
      await readFile(file);
    } catch {
      continue;
    }
    await writeVersion(file, next);
    console.log(`  packages/${entry.name}/package.json -> ${next}`);
  }

  console.log("");
  console.log(`Version set to ${next}.`);
}

await main();
