import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Default Vite config. We will use programmatic builds for per-entry outputs.
export default defineConfig({
  plugins: [vue()],
});
