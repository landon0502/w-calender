import { defineWorkspace } from 'vitest/config';
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
    },
  },
]);
