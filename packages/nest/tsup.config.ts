import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  esbuildOptions: (opts) => {
    opts.sourceRoot = './nest/dist/';
  },
  format: ['esm'],
  bundle: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
