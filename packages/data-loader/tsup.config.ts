import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src/index.ts', '!src/**/*.test.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
