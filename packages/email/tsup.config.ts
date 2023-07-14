import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src/index.ts', 'src/templates/index.ts', '!src/**/*.test.ts'],
  format: ['cjs', 'esm'],
  inject: ['./react-shim.ts'],
  dts: true,
  sourcemap: true,
  clean: true,
});
