import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  esbuildOptions: (opts) => {
    opts.sourceRoot = './dist/';
  },
  format: ['esm'],
  bundle: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
