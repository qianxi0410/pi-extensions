/**
 * Global Vitest setup, loaded once per test worker before any test file.
 *
 * Keep this module dependency-free and side-effect-light: it runs in every
 * worker, including ones that never import a Pi package.
 */

// Pin the timezone so date/number formatting is identical on every machine and
// in CI.
process.env.TZ = "UTC";
