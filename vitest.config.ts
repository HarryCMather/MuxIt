import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: [ "test/unit/**/*.ts" ],
    globals: true,
    setupFiles: [ "./test/vitest.setup.ts" ],
    coverage: {
      reporter: [ "text", "lcov" ],
      all: true,
      include: [ "src/**/*.{ts,tsx}" ]
    }
  }
});
