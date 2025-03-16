import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
  plugins: [injectHTML()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        userList: resolve(__dirname, 'src/pages/users/index.html'),
        userAdd: resolve(__dirname, 'src/pages/users/add.html'),
        userEdit: resolve(__dirname, 'src/pages/users/edit.html'),
        postList: resolve(__dirname, 'src/pages/posts/index.html'),
        postAdd: resolve(__dirname, 'src/pages/posts/add.html'),
        postEdit: resolve(__dirname, 'src/pages/posts/edit.html'),
        categoryList: resolve(__dirname, 'src/pages/categories/index.html'),
        categoryAdd: resolve(__dirname, 'src/pages/categories/add.html'),
        categoryEdit: resolve(__dirname, 'src/pages/categories/edit.html'),
        commentList: resolve(__dirname, 'src/pages/comments/index.html'),
        commentEdit: resolve(__dirname, 'src/pages/comments/edit.html'),
        languageList: resolve(__dirname, 'src/pages/languages/index.html'),
        languageAdd: resolve(__dirname, 'src/pages/languages/add.html'),
        languageEdit: resolve(__dirname, 'src/pages/languages/edit.html'),
        settings: resolve(__dirname, 'src/pages/settings/index.html'),
      }
    }
  }
});