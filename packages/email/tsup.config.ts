import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  esbuildOptions: (opts) => {
    opts.sourceRoot = './email/dist/';
  },
  format: ['esm'],
  bundle: false,
  inject: ['./react-shim.ts'],
  dts: true,
  sourcemap: true,
  clean: true,
});
