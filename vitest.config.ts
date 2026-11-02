import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"]
  },
  resolve: {
    alias: {
      // fileURLToPath, not URL.pathname: the latter percent-encodes, so a
      // folder containing a space ("My Projects") resolved to a path that
      // does not exist and every "@/..." import failed.
      "@": fileURLToPath(new URL("./", import.meta.url))
    }
  }
});
