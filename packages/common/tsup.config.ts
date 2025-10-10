import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: [
    'src/index.ts',
    'src/case/index.ts',
    'src/node/index.ts',
    'src/temporal/luxon/index.ts',
    '!src/**/*.test.ts',
  ],
  esbuildOptions: (opts) => {
    opts.sourceRoot = './dist/';
  },
  external: ['@seedcompany/common'],
  target: 'es2019',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
