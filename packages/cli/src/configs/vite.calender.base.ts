import { defineConfig, InlineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import path from 'path';

const root = process.cwd();
export default defineConfig({
  plugins: [
    eslintPlugin({
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/*.js', 'src/*.jsx'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat', // 必须放在 test-utils 下面
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  css: {
    preprocessorOptions: {
      // 全局样式引入
      scss: {
        api: 'modern-compiler', // 或 "modern"，"legacy"
        importers: [],
        additionalData: `@use "@/style/variable.scss" as *;`,
      },
    },
  },

  build: {
    target: 'modules',
    outDir: path.resolve(root, './dist'),
    rollupOptions: {},
    lib: {
      entry: path.resolve(root, './src/index.tsx'),
      formats: ['umd', 'es'],
      name: 'w-calender',
    },
  },
}) as InlineConfig;
