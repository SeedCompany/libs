import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  format: ['esm'],
  bundle: false,
  inject: ['./react-shim.ts'],
  dts: true,
  sourcemap: true,
  clean: true,
});
