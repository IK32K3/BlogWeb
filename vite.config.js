import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        posts: resolve(__dirname, 'src/pages/posts.html'),
        categories: resolve(__dirname, 'src/pages/categories.html'),
        comments: resolve(__dirname, 'src/pages/comments.html'),
        users: resolve(__dirname, 'src/pages/users.html'),
        languages: resolve(__dirname, 'src/pages/languages.html'),
        settings: resolve(__dirname, 'src/pages/settings.html')
      }
    }
  },
  server: {
    port: 5173,
    open: '/pages/index.html'
  }
});