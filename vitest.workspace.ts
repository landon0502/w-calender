import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*',
  // {
  //   extends: './packages/cli/src/configs/vite.calender.base.ts',
  //   test: {
  //     // ...
  //     include: ['tests/**/*.{browser}.test.{ts,js}'],
  //     // 在使用内联配置的时候，建议定义一个名称
  //     name: 'w-calender-test',
  //     environment: 'w-calender-test',
  //   },
  // },
  // {
  //   test: {
  //     include: ['tests/**/*.{node}.test.{ts,js}'],
  //     name: 'node',
  //     environment: 'node',
  //   },
  // },
]);
