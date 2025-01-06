import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'packages/dist/*', 'node_modules', './types/*'],
  },
});
