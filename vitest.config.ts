import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: false,
  plugins: [
    // Use SWC, instead of esbuild, for NestJS decorator metadata support
    swc.vite({
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }),
  ],
  test: {
    passWithNoTests: true,
    watch: false,
  },
});
