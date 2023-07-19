import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  bundle: false,
  format: ['cjs'],
  inject: ['./react-shim.ts'],
  sourcemap: true,
  clean: true,
});
