import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@fieldtest/doc-ref': path.resolve(__dirname, '../doc-ref/dist'),
    },
  },
});
