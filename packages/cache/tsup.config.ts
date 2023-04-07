import { cp } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export const tsup = defineConfig({
  entry: ['src', '!src/**/*.test.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  onSuccess: async () => {
    for (const file of ['package.json', 'README.md', 'CHANGELOG.md']) {
      await cp(file, `dist/${file}`);
    }
  },
});
