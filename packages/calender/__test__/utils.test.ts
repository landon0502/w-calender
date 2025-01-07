import { expect, test } from 'vitest';
import { isEmpty, isUndef } from '../src/utils';

test('test isEmpty utils', () => {
  let res1 = isEmpty({});
  let res2 = isEmpty([]);
  expect([res1, res2]).toEqual([true, true]);
});

test('test isUndef utils', () => {
  let res1 = isUndef('');
  let res2 = isUndef(void 0);
  expect([res1, res2]).toEqual([false, true]);
});
