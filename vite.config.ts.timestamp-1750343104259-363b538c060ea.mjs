// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
    // Fix for "Multiple instances of Three.js being imported" warning
    dedupe: ["three"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          visualization: ["three", "3d-force-graph", "three-spritetext"],
          ui: ["lucide-react"],
          utils: ["lodash", "d3", "date-fns"],
          markdown: ["react-markdown", "remark-gfm", "rehype-raw"]
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAvLyBGaXggZm9yIFwiTXVsdGlwbGUgaW5zdGFuY2VzIG9mIFRocmVlLmpzIGJlaW5nIGltcG9ydGVkXCIgd2FybmluZ1xuICAgIGRlZHVwZTogWyd0aHJlZSddXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICB2aXN1YWxpemF0aW9uOiBbJ3RocmVlJywgJzNkLWZvcmNlLWdyYXBoJywgJ3RocmVlLXNwcml0ZXRleHQnXSxcbiAgICAgICAgICB1aTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgICAgICB1dGlsczogWydsb2Rhc2gnLCAnZDMnLCAnZGF0ZS1mbnMnXSxcbiAgICAgICAgICBtYXJrZG93bjogWydyZWFjdC1tYXJrZG93bicsICdyZW1hcmstZ2ZtJywgJ3JlaHlwZS1yYXcnXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDBcbiAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUE7QUFBQSxJQUV4QixRQUFRLENBQUMsT0FBTztBQUFBLEVBQ2xCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDN0IsZUFBZSxDQUFDLFNBQVMsa0JBQWtCLGtCQUFrQjtBQUFBLFVBQzdELElBQUksQ0FBQyxjQUFjO0FBQUEsVUFDbkIsT0FBTyxDQUFDLFVBQVUsTUFBTSxVQUFVO0FBQUEsVUFDbEMsVUFBVSxDQUFDLGtCQUFrQixjQUFjLFlBQVk7QUFBQSxRQUN6RDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSx1QkFBdUI7QUFBQSxFQUN6QjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
