import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  bundle: false,
  format: ['cjs', 'esm'],
  inject: ['./react-shim.ts'],
  dts: true,
  sourcemap: true,
  clean: true,
});
