# pi-extensions

A pnpm workspace for developing, testing, and publishing [Pi](https://github.com/earendil-works/pi)
packages — extensions, skills, prompts, and themes — in one place. Every package
shares one toolchain, one test runner, and one version, so they evolve and ship
together.

This repository currently contains the scaffold only. Add the first package with
`pnpm new <name>`.

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer (`corepack enable` works too)

## Setup

```bash
pnpm install
```

That installs the workspace, links local packages, and sets up the Husky git
hooks.

## Layout

```text
.
├── packages/              # one directory per Pi package (@qianxi0410/pi-*)
│   └── README.md          # package conventions
├── scripts/
│   ├── new-package.mjs    # scaffold a new package
│   └── version.mjs        # lockstep version bump
├── test/setup.ts          # global Vitest setup
├── .oxfmtrc.json          # formatter config (oxfmt)
├── .oxlintrc.json         # linter config (oxlint)
├── vitest.config.ts       # one runner for every package
├── tsconfig.base.json     # one TypeScript config for the workspace
└── pnpm-workspace.yaml    # workspace + shared dependency catalog
```

## Commands

Run these from the repository root.

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `pnpm new <name>`         | Scaffold `packages/pi-<name>`                  |
| `pnpm fmt`                | Format the workspace with oxfmt                |
| `pnpm fmt:check`          | Check formatting without writing               |
| `pnpm lint`               | Lint with oxlint                               |
| `pnpm lint:fix`           | Lint and apply safe fixes                      |
| `pnpm typecheck`          | Type-check with `tsc --noEmit`                 |
| `pnpm test`               | Run every package's tests once                 |
| `pnpm test:watch`         | Run tests in watch mode                        |
| `pnpm coverage`           | Run tests with coverage                        |
| `pnpm check`              | Format check + lint + typecheck (what CI runs) |
| `pnpm version:set <bump>` | Bump every package in lockstep                 |

## Add a package

```bash
pnpm new todo              # creates packages/pi-todo
pnpm install
pnpm test
pi -e ./packages/pi-todo   # load the extension during development
```

See [packages/README.md](./packages/README.md) for package conventions, or the
upstream [Pi packages](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md)
and [extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md)
docs for the resource model.

## Conventions

- **Lockstep versions.** All packages share one version, enforced by
  `pnpm version:set`. Nothing is released on its own.
- **No build step.** Packages publish TypeScript sources; Pi loads them through
  `jiti`. There is no `dist/` and no per-package tsconfig.
- **One config.** A single `tsconfig.base.json`, `.oxlintrc.json`,
  `.oxfmtrc.json`, and `vitest.config.ts` cover the whole workspace.
- **Host packages are peers.** Pi injects `@earendil-works/pi-*` and `typebox`
  at runtime, so packages declare them as `peerDependencies`, never bundle them.
- **Tests block pushes, not commits.** The `pre-commit` hook runs the read-only
  `pnpm check`; the `pre-push` hook runs the test suite.

## License

MIT. See [LICENSE](./LICENSE).
