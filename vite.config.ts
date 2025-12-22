// import { defineConfig } from "vite";

// export default defineConfig({
//   server: {
//     port: 3000,
//   },
//   preview: {
//     port: 3000,
//   },
// });
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },

  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
