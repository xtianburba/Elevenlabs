import { defineConfig } from "vite";

export default defineConfig({
  // Requerido para GitHub Pages en repo de proyecto
  base: "/Elevenlabs/",
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        landing: "landing.html"
      }
    }
  },
  server: {
    fs: {
      // Permite cargar en local las imagenes que subiste en Cursor
      allow: [
        "c:/Users/KrystianBurba/Desktop/WEBS/Elevenlabs",
        "c:/Users/KrystianBurba/.cursor/projects/c-Users-KrystianBurba-Desktop-WEBS-Elevenlabs/assets"
      ]
    }
  }
});
