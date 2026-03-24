import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    setupFiles: [fileURLToPath(new URL("./test/setup.ts", import.meta.url))]
  }
});
