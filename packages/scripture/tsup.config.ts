import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src/index.ts', '!src/**/*.test.ts'],
  esbuildOptions: (opts) => {
    opts.sourceRoot = './scripture/dist/';
  },
  format: ['cjs', 'esm'],
  target: 'es2019',
  dts: true,
  sourcemap: true,
  clean: true,
});
