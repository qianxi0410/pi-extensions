#!/usr/bin/env node
/**
 * Scaffold a new Pi package under `packages/`.
 *
 * Usage:
 *   pnpm new <name>              # creates packages/pi-<name>
 *   pnpm new pi-<name>           # same, prefix is not duplicated
 *   pnpm new <name> --dir <dir>  # override the directory name
 *
 * The generated package is a minimal, valid Pi package: a `package.json` with a
 * `pi` manifest, an `index.ts` extension entry point, a README, the root
 * LICENSE, and a placeholder test. Dependencies are not installed; run
 * `pnpm install` afterwards.
 */

import { execFileSync } from "node:child_process";
import { access, copyFile, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCOPE = "@qianxi0410";
const DEFAULT_PREFIX = "pi-";

/** @param {string} path */
async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string[]} argv
 * @returns {{ name: string, dir: string | undefined }}
 */
function parseArgs(argv) {
  const positional = [];
  let dir;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dir" || arg === "-d") {
      dir = argv[i + 1];
      i += 1;
    } else if (arg?.startsWith("--dir=")) {
      dir = arg.slice("--dir=".length);
    } else if (arg) {
      positional.push(arg);
    }
  }

  const name = positional[0];
  if (!name) {
    console.error("Usage: pnpm new <name> [--dir <directory>]");
    process.exit(1);
  }

  return { name, dir };
}

/** @param {string} name */
function packageJson(name) {
  const extensionName = name.startsWith(DEFAULT_PREFIX) ? name : `${DEFAULT_PREFIX}${name}`;
  return `{
  "name": "${SCOPE}/${extensionName}",
  "version": "0.0.0",
  "description": "Pi package: ${extensionName}",
  "keywords": ["pi-package", "pi-extension"],
  "type": "module",
  "license": "MIT",
  "pi": {
    "extensions": ["./index.ts"]
  },
  "files": ["index.ts", "docs/", "README.md", "LICENSE", "!docs/*.png", "!docs/*.svg"],
  "scripts": {
    "test": "vitest run"
  },
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*"
  }
}
`;
}

/** @param {string} name */
function indexTs(name) {
  const title = name.startsWith(DEFAULT_PREFIX) ? name : `${DEFAULT_PREFIX}${name}`;
  return `import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * ${title} — Pi package entry point.
 *
 * Register tools, commands, and event handlers on \`pi\`. See the Pi extension
 * docs for the available integration points.
 */
export default function (pi: ExtensionAPI): void {
  void pi;
}
`;
}

/** @param {string} name */
function readme(name) {
  const title = name.startsWith(DEFAULT_PREFIX) ? name : `${DEFAULT_PREFIX}${name}`;
  return `# ${SCOPE}/${title}

A Pi package.

## Install

\`\`\`bash
pi install npm:${SCOPE}/${title}
\`\`\`

During development, load it straight from the workspace:

\`\`\`bash
pi -e ./packages/${title}
\`\`\`

## Development

\`\`\`bash
pnpm install
pnpm test
\`\`\`
`;
}

/** @param {string} name */
function testTs(name) {
  return `import { describe, expect, it } from "vitest";

describe("${name}", () => {
  it("has a placeholder test", () => {
    expect(true).toBe(true);
  });
});
`;
}

/**
 * Format the generated files with the workspace's oxfmt so the new package is
 * immediately clean under `pnpm fmt:check`. Falls back to a warning if oxfmt
 * is not installed yet.
 *
 * @param {string} target
 * @param {string} label
 */
function format(target, label) {
  const binary = process.platform === "win32" ? "oxfmt.cmd" : "oxfmt";
  const oxfmt = join(ROOT, "node_modules", ".bin", binary);

  try {
    execFileSync(oxfmt, [target], { cwd: ROOT, stdio: "ignore" });
  } catch {
    console.warn(`Could not format ${label}; run 'pnpm fmt' once oxfmt is installed.`);
  }
}

async function main() {
  const { name, dir } = parseArgs(process.argv.slice(2));
  const extensionName = name.startsWith(DEFAULT_PREFIX) ? name : `${DEFAULT_PREFIX}${name}`;
  const dirName = dir ?? extensionName;
  const target = join(ROOT, "packages", dirName);
  const relativeTarget = join("packages", dirName);

  if (await exists(target)) {
    console.error(`Error: ${relativeTarget} already exists.`);
    process.exit(1);
  }

  await mkdir(target, { recursive: true });
  await writeFile(join(target, "package.json"), packageJson(extensionName));
  await writeFile(join(target, "index.ts"), indexTs(extensionName));
  await writeFile(join(target, "index.test.ts"), testTs(extensionName));
  await writeFile(join(target, "README.md"), readme(extensionName));
  await copyFile(join(ROOT, "LICENSE"), join(target, "LICENSE"));

  format(target, relativeTarget);

  console.log(`Created ${relativeTarget}`);
  console.log("");
  console.log("Next steps:");
  console.log("  pnpm install");
  console.log(`  pnpm test`);
  console.log(`  pi -e ./${relativeTarget}`);
}

await main();
