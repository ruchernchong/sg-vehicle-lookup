import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.{js,ts}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/"],
    },
  },
});
