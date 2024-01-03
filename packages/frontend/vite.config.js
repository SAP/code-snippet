import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [vue()],
//   base: "./",
//   resolve: {
//     alias: {
//       // If you have a specific entry file for Vue, replace it here.
//       vue: "vue/dist/vue.esm-bundler.js",
//     },
//     extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
//   },
//   build: {
//     sourcemap: true,
//   },
// });

export default defineConfig({
  plugins: [vue()],
  base: "./",
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
});
