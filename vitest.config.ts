import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // Mirror the `@/*` -> `src/*` alias that the app build gets from
    // @lovable.dev/vite-tanstack-config, so tests can import the same specifiers
    // the source uses.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
