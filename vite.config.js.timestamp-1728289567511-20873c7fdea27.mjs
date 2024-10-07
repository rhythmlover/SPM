// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/Wei/Documents/SMU/Y3-T1/IS212_SPM/Project/SPM-Codebase/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Wei/Documents/SMU/Y3-T1/IS212_SPM/Project/SPM-Codebase/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Icons from "file:///C:/Users/Wei/Documents/SMU/Y3-T1/IS212_SPM/Project/SPM-Codebase/node_modules/unplugin-icons/dist/vite.js";
import Components from "file:///C:/Users/Wei/Documents/SMU/Y3-T1/IS212_SPM/Project/SPM-Codebase/node_modules/unplugin-vue-components/dist/vite.js";
import { BootstrapVueNextResolver } from "file:///C:/Users/Wei/Documents/SMU/Y3-T1/IS212_SPM/Project/SPM-Codebase/node_modules/bootstrap-vue-next/dist/bootstrap-vue-next.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Wei/Documents/SMU/Y3-T1/IS212_SPM/Project/SPM-Codebase/vite.config.js";
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
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  test: {
    setupFiles: "./setupTests.js"
    // Your setup file where the mock is defined
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxXZWlcXFxcRG9jdW1lbnRzXFxcXFNNVVxcXFxZMy1UMVxcXFxJUzIxMl9TUE1cXFxcUHJvamVjdFxcXFxTUE0tQ29kZWJhc2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFdlaVxcXFxEb2N1bWVudHNcXFxcU01VXFxcXFkzLVQxXFxcXElTMjEyX1NQTVxcXFxQcm9qZWN0XFxcXFNQTS1Db2RlYmFzZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvV2VpL0RvY3VtZW50cy9TTVUvWTMtVDEvSVMyMTJfU1BNL1Byb2plY3QvU1BNLUNvZGViYXNlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xyXG5cclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnO1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcclxuaW1wb3J0IHsgQm9vdHN0cmFwVnVlTmV4dFJlc29sdmVyIH0gZnJvbSAnYm9vdHN0cmFwLXZ1ZS1uZXh0JztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgdnVlKCksXHJcbiAgICBDb21wb25lbnRzKHtcclxuICAgICAgcmVzb2x2ZXJzOiBbQm9vdHN0cmFwVnVlTmV4dFJlc29sdmVyKCldLFxyXG4gICAgfSksXHJcbiAgICBJY29ucyh7XHJcbiAgICAgIGNvbXBpbGVyOiAndnVlMycsXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHRlc3Q6IHtcclxuICAgIHNldHVwRmlsZXM6ICcuL3NldHVwVGVzdHMuanMnLCAvLyBZb3VyIHNldHVwIGZpbGUgd2hlcmUgdGhlIG1vY2sgaXMgZGVmaW5lZFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlZLFNBQVMsZUFBZSxXQUFXO0FBRXBhLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyxnQ0FBZ0M7QUFOOE0sSUFBTSwyQ0FBMkM7QUFTeFMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osV0FBVztBQUFBLE1BQ1QsV0FBVyxDQUFDLHlCQUF5QixDQUFDO0FBQUEsSUFDeEMsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLE1BQ0osVUFBVTtBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNO0FBQUEsSUFDSixZQUFZO0FBQUE7QUFBQSxFQUNkO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
