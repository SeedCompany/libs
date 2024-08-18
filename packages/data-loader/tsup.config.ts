import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src/index.ts', '!src/**/*.test.ts'],
  format: ['esm'],
  bundle: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
