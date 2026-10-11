import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // One runner for the whole workspace; every package's tests are discovered
    // by convention rather than per-package vitest configs.
    include: ["packages/*/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    testTimeout: 15_000,
    hookTimeout: 30_000,
    passWithNoTests: true,
    unstubGlobals: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["packages/*/**/*.ts"],
      exclude: ["**/node_modules/**", "**/*.test.ts", "**/*.d.ts", "**/index.ts", "**/docs/**"],
      // Uncomment once packages exist and set thresholds that match your bar.
      // thresholds: { statements: 90, branches: 80, functions: 90, lines: 90 },
    },
  },
});
