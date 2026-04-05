import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "components": "/src/components",
      "scenes": "/src/scenes",
      "state": "/src/state"
    }
  }
});
