import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Keep every generated URL relative to the deployed index.html. GitHub Pages
  // may serve the artifact below a repository path or a custom domain; a fixed
  // repository prefix makes the JavaScript and CSS return 404 in the latter
  // case and leaves the root element empty.
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
