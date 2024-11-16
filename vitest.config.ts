import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // Use SWC, instead of esbuild, for NestJS decorator metadata support
    swc.vite(),
  ],
  test: {
    passWithNoTests: true,
    watch: false,
  },
});
