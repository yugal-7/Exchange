import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/tests/**/*.test.ts"],
        // The property suite deliberately explores large random order streams;
        // give it room without letting a pathological case hang CI forever.
        testTimeout: 30_000,
    },
});
