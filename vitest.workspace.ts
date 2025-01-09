import { defineWorkspace } from 'vitest/config';
import path from 'path';

const root = process.cwd();
export default defineWorkspace([
  'packages/calender',
  {
    extends: './packages/calender/vitest.config.ts',
    test: {
      // ...
      // include: ['tests/**/*.{browser}.test.{ts,js}'],
      // 在使用内联配置的时候，建议定义一个名称
      name: 'w-calender-test',
      environment: 'node',
      setupFiles: './testSetup.ts',
      alias: {
        '@': path.resolve(root, './packages/calender/src'),
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat', // 必须放在 test-utils 下面
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },
  },
]);
