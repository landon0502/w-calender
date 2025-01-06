import { expect, test } from 'vitest';
import { isTimeBetween, getReturnTime, getTimes, getTimeStartAndEnd } from '../src/utils/time';
import dayjs from 'dayjs';

test('test getReturnTime utils', () => {
  let res = getReturnTime('2024-12-12');
  expect(res.time.format('YYYY-MM-DD')).toBe('2024-12-12');
});

test('test getTimes utils', () => {
  let res = getTimes('2024-12-12 00:00', '2024-12-12 23:59', 30, 'minute');
  expect(res.length).toBe(48);
});

test('test isTimeBetween utils', () => {
  let res = isTimeBetween('2024-12-12', ['2024-12-11', '2024-12-13']);
  expect(res).toBe(true);
});

test('test getTimeStartAndEnd utils', () => {
  let res = getTimeStartAndEnd('2024-12-12', 'day');
  expect(
    res[0].time.isSame(dayjs('2024-12-12 00:00'), 'm') &&
      res[1].time.isSame(dayjs('2024-12-12 23:59'), 'm')
  ).toBe(true);
});
