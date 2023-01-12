// vite.config.ts
import { defineConfig } from "file:///F:/libraries/desktop/sdk/slice-machine/node_modules/vite/dist/node/index.js";
import sdk from "file:///F:/libraries/desktop/sdk/slice-machine/node_modules/vite-plugin-sdk/dist/index.js";
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: {
        index: "./src/index.ts",
        cli: "./src/cli.ts"
      }
    }
  },
  plugins: [
    sdk({
      internalDependencies: ["execa", "meow", "globby"]
    })
  ],
  test: {
    coverage: {
      reporter: ["lcovonly", "text"]
    },
    setupFiles: ["./test/__setup__.ts"],
    deps: {
      inline: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxsaWJyYXJpZXNcXFxcZGVza3RvcFxcXFxzZGtcXFxcc2xpY2UtbWFjaGluZVxcXFxwYWNrYWdlc1xcXFxpbml0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxsaWJyYXJpZXNcXFxcZGVza3RvcFxcXFxzZGtcXFxcc2xpY2UtbWFjaGluZVxcXFxwYWNrYWdlc1xcXFxpbml0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9saWJyYXJpZXMvZGVza3RvcC9zZGsvc2xpY2UtbWFjaGluZS9wYWNrYWdlcy9pbml0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBzZGsgZnJvbSBcInZpdGUtcGx1Z2luLXNka1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRidWlsZDoge1xuXHRcdGxpYjoge1xuXHRcdFx0ZW50cnk6IHtcblx0XHRcdFx0aW5kZXg6IFwiLi9zcmMvaW5kZXgudHNcIixcblx0XHRcdFx0Y2xpOiBcIi4vc3JjL2NsaS50c1wiLFxuXHRcdFx0fSxcblx0XHR9LFxuXHR9LFxuXHRwbHVnaW5zOiBbXG5cdFx0c2RrKHtcblx0XHRcdGludGVybmFsRGVwZW5kZW5jaWVzOiBbXCJleGVjYVwiLCBcIm1lb3dcIiwgXCJnbG9iYnlcIl0sXG5cdFx0fSksXG5cdF0sXG5cdHRlc3Q6IHtcblx0XHRjb3ZlcmFnZToge1xuXHRcdFx0cmVwb3J0ZXI6IFtcImxjb3Zvbmx5XCIsIFwidGV4dFwiXSxcblx0XHR9LFxuXHRcdHNldHVwRmlsZXM6IFtcIi4vdGVzdC9fX3NldHVwX18udHNcIl0sXG5cdFx0ZGVwczoge1xuXHRcdFx0aW5saW5lOiB0cnVlLFxuXHRcdH0sXG5cdH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFYsU0FBUyxvQkFBb0I7QUFDelgsT0FBTyxTQUFTO0FBRWhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLE9BQU87QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNKLE9BQU87QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQLEtBQUs7QUFBQSxNQUNOO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLElBQUk7QUFBQSxNQUNILHNCQUFzQixDQUFDLFNBQVMsUUFBUSxRQUFRO0FBQUEsSUFDakQsQ0FBQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNMLFVBQVU7QUFBQSxNQUNULFVBQVUsQ0FBQyxZQUFZLE1BQU07QUFBQSxJQUM5QjtBQUFBLElBQ0EsWUFBWSxDQUFDLHFCQUFxQjtBQUFBLElBQ2xDLE1BQU07QUFBQSxNQUNMLFFBQVE7QUFBQSxJQUNUO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
