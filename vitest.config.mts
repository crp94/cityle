import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Pure game-logic functions only (no React components), so the plain `node`
// test environment is enough — no jsdom needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
