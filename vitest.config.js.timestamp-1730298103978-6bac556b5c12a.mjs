// vitest.config.js
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { mergeConfig, defineConfig as defineConfig2, configDefaults } from "file:///C:/wamp64/www/SPM/node_modules/vitest/dist/config.js";

// vite.config.js
import { fileURLToPath, URL as URL2 } from "node:url";
import { defineConfig } from "file:///C:/wamp64/www/SPM/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/wamp64/www/SPM/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Icons from "file:///C:/wamp64/www/SPM/node_modules/unplugin-icons/dist/vite.js";
import Components from "file:///C:/wamp64/www/SPM/node_modules/unplugin-vue-components/dist/vite.js";
import { BootstrapVueNextResolver } from "file:///C:/wamp64/www/SPM/node_modules/bootstrap-vue-next/dist/bootstrap-vue-next.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/wamp64/www/SPM/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [BootstrapVueNextResolver()]
    }),
    Icons({
      compiler: "vue3"
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL2("./src", __vite_injected_original_import_meta_url))
    }
  },
  test: {
    setupFiles: "./setupTests.js"
    // Your setup file where the mock is defined
  }
});

// vitest.config.js
var __vite_injected_original_import_meta_url2 = "file:///C:/wamp64/www/SPM/vitest.config.js";
var vitest_config_default = mergeConfig(
  vite_config_default,
  defineConfig2({
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**", "backend/**"],
      root: fileURLToPath2(new URL("./", __vite_injected_original_import_meta_url2)),
      coverage: {
        provider: "v8",
        reporters: ["html"],
        reportsDirectory: "./tests-coverage",
        include: ["src/components/**", "src/views/**"]
      },
      testTimeout: 1e4
    }
  })
);
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy5qcyIsICJ2aXRlLmNvbmZpZy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXHdhbXA2NFxcXFx3d3dcXFxcU1BNXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFx3YW1wNjRcXFxcd3d3XFxcXFNQTVxcXFx2aXRlc3QuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi93YW1wNjQvd3d3L1NQTS92aXRlc3QuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcclxuaW1wb3J0IHsgbWVyZ2VDb25maWcsIGRlZmluZUNvbmZpZywgY29uZmlnRGVmYXVsdHMgfSBmcm9tICd2aXRlc3QvY29uZmlnJztcclxuaW1wb3J0IHZpdGVDb25maWcgZnJvbSAnLi92aXRlLmNvbmZpZyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBtZXJnZUNvbmZpZyhcclxuICB2aXRlQ29uZmlnLFxyXG4gIGRlZmluZUNvbmZpZyh7XHJcbiAgICB0ZXN0OiB7XHJcbiAgICAgIGVudmlyb25tZW50OiAnanNkb20nLFxyXG4gICAgICBleGNsdWRlOiBbLi4uY29uZmlnRGVmYXVsdHMuZXhjbHVkZSwgJ2UyZS8qKicsICdiYWNrZW5kLyoqJ10sXHJcbiAgICAgIHJvb3Q6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi8nLCBpbXBvcnQubWV0YS51cmwpKSxcclxuICAgICAgY292ZXJhZ2U6IHtcclxuICAgICAgICBwcm92aWRlcjogJ3Y4JyxcclxuICAgICAgICByZXBvcnRlcnM6IFsnaHRtbCddLFxyXG4gICAgICAgIHJlcG9ydHNEaXJlY3Rvcnk6ICcuL3Rlc3RzLWNvdmVyYWdlJyxcclxuICAgICAgICBpbmNsdWRlOiBbJ3NyYy9jb21wb25lbnRzLyoqJywgJ3NyYy92aWV3cy8qKiddLFxyXG4gICAgICB9LFxyXG4gICAgICB0ZXN0VGltZW91dDogMTAwMDAsXHJcbiAgICB9LFxyXG4gIH0pLFxyXG4pO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXHdhbXA2NFxcXFx3d3dcXFxcU1BNXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFx3YW1wNjRcXFxcd3d3XFxcXFNQTVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovd2FtcDY0L3d3dy9TUE0vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgSWNvbnMgZnJvbSAndW5wbHVnaW4taWNvbnMvdml0ZSc7XHJcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xyXG5pbXBvcnQgeyBCb290c3RyYXBWdWVOZXh0UmVzb2x2ZXIgfSBmcm9tICdib290c3RyYXAtdnVlLW5leHQnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICByZXNvbHZlcnM6IFtCb290c3RyYXBWdWVOZXh0UmVzb2x2ZXIoKV0sXHJcbiAgICB9KSxcclxuICAgIEljb25zKHtcclxuICAgICAgY29tcGlsZXI6ICd2dWUzJyxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgdGVzdDoge1xyXG4gICAgc2V0dXBGaWxlczogJy4vc2V0dXBUZXN0cy5qcycsIC8vIFlvdXIgc2V0dXAgZmlsZSB3aGVyZSB0aGUgbW9jayBpcyBkZWZpbmVkXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVAsU0FBUyxpQkFBQUEsc0JBQXFCO0FBQy9RLFNBQVMsYUFBYSxnQkFBQUMsZUFBYyxzQkFBc0I7OztBQ0RtTCxTQUFTLGVBQWUsT0FBQUMsWUFBVztBQUVoUixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsZ0NBQWdDO0FBTndHLElBQU0sMkNBQTJDO0FBU2xNLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFdBQVc7QUFBQSxNQUNULFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQztBQUFBLElBQ3hDLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxNQUNKLFVBQVU7QUFBQSxJQUNaLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSUMsS0FBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFlBQVk7QUFBQTtBQUFBLEVBQ2Q7QUFDRixDQUFDOzs7QUQzQmtKLElBQU1DLDRDQUEyQztBQUlwTSxJQUFPLHdCQUFRO0FBQUEsRUFDYjtBQUFBLEVBQ0FDLGNBQWE7QUFBQSxJQUNYLE1BQU07QUFBQSxNQUNKLGFBQWE7QUFBQSxNQUNiLFNBQVMsQ0FBQyxHQUFHLGVBQWUsU0FBUyxVQUFVLFlBQVk7QUFBQSxNQUMzRCxNQUFNQyxlQUFjLElBQUksSUFBSSxNQUFNRix5Q0FBZSxDQUFDO0FBQUEsTUFDbEQsVUFBVTtBQUFBLFFBQ1IsVUFBVTtBQUFBLFFBQ1YsV0FBVyxDQUFDLE1BQU07QUFBQSxRQUNsQixrQkFBa0I7QUFBQSxRQUNsQixTQUFTLENBQUMscUJBQXFCLGNBQWM7QUFBQSxNQUMvQztBQUFBLE1BQ0EsYUFBYTtBQUFBLElBQ2Y7QUFBQSxFQUNGLENBQUM7QUFDSDsiLAogICJuYW1lcyI6IFsiZmlsZVVSTFRvUGF0aCIsICJkZWZpbmVDb25maWciLCAiVVJMIiwgIlVSTCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgImRlZmluZUNvbmZpZyIsICJmaWxlVVJMVG9QYXRoIl0KfQo=
