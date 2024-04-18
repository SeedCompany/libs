import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  esbuildOptions: (opts) => {
    opts.sourceRoot = './nest/dist/';
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
