import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["test/**/*.test.ts", "xic/test/**/*.test.ts"],
    coverage: {
      enabled: true,
      lines: 100,
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"]
    }
  }
});
