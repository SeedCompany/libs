import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // Use SWC, instead of esbuild, for NestJS decorator metadata support
    swc.vite({}),
    react({}),
  ],
  test: {
    passWithNoTests: true,
    watch: false,
  },
});
