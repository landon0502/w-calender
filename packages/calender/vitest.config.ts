import { defineConfig, configDefaults } from 'vitest/config';
import path from 'path';

const root = process.cwd();
export default defineConfig({
  test: {
    alias: {
      '@': path.resolve(root, './src'),
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat', // 必须放在 test-utils 下面
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, 'packages/dist/*', 'node_modules', './types/*'],
  },
});
