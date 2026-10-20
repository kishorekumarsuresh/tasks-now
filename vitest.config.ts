import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Tests import app.ts directly (not server.ts), so .env must be loaded here
    setupFiles: ['dotenv/config'],
    // Real Neon DB: the first connection can take a few seconds while the compute wakes up
    testTimeout: 15000,
  },
});
