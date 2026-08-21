import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // The engine pulls a native module and the ephemeris files; it belongs to
  // the server bundle and must never be pre-bundled for the browser.
  ssr: { external: ['@shipan/core', '@shipan/geo', '@shipan/plate'] },
  test: { include: ['test/**/*.test.ts'] },
});
