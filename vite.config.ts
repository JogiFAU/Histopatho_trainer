import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages hosts this project below /Histopatho_trainer/.  Using an
  // explicit public base keeps runtime-loaded atlas images below that prefix
  // instead of resolving them against github.io's domain root.
  base: "/Histopatho_trainer/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
