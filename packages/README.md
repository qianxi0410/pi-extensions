# packages/

One directory per Pi package. Each directory is a standalone npm package named
`@qianxi0410/pi-<name>` and declares its Pi resources under the `pi` key of its
`package.json`.

## Add a package

```bash
pnpm new <name>            # -> packages/pi-<name>
pnpm new <name> --dir foo  # -> packages/foo
pnpm install
```

The generator writes a minimal extension (`index.ts`), a package manifest with
a `pi` manifest, a README, the root LICENSE, and a placeholder test. Delete
anything you do not need.

## Conventions

- **Name**: `@qianxi0410/pi-<name>`. The `<name>` matches the directory.
- **Entry point**: `index.ts` default-exports a factory `(pi: ExtensionAPI) => void`.
- **Manifest**: list your extension(s) under `pi.extensions`; add `pi.skills`,
  `pi.prompts`, and `pi.themes` for other resource types.
- **Host packages**: declare `@earendil-works/pi-ai`, `.../pi-coding-agent`,
  `.../pi-tui`, and `typebox` as `peerDependencies` with `"*"`. Never put them
  in `dependencies` — Pi provides them at runtime, and a bundled copy can create
  duplicate registries.
- **Runtime dependencies**: put real npm dependencies in `dependencies` and
  reference shared versions from the workspace `catalog:` in
  `pnpm-workspace.yaml`.
- **Versioning**: all packages share one version. Bump it with
  `pnpm version:set patch|minor|major|x.y.z`; never edit a single package's
  version by hand.
- **Files**: keep the `files` array in `package.json` accurate so tests and
  local docs are not published.

## Test and check

The root Vitest runner discovers `packages/*/**/*.test.ts`. From the repo root:

```bash
pnpm test       # run all tests
pnpm lint       # oxlint
pnpm fmt        # oxfmt
pnpm typecheck  # tsc --noEmit
pnpm check      # all of the above (read-only)
```
