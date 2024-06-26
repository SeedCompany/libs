import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src/index.ts', 'src/temporal/luxon/index.ts', '!src/**/*.test.ts'],
  esbuildOptions: (opts) => {
    opts.sourceRoot = './dist/';
  },
  external: ['@seedcompany/common'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
