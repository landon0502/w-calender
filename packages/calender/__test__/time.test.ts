import { expect, test } from 'vitest';
import {
  isTimeBetween,
  getReturnTime,
  getTimes,
  getTimeStartAndEnd,
  isCrossoverTime,
  isContainTimeRange,
  isReturnTime,
  format,
  getWeekDays,
} from '../src/utils';
import dayjs from 'dayjs';

test('test getReturnTime timeUtils', () => {
  let res = getReturnTime('2024-12-12');
  expect(res.time.format('YYYY-MM-DD')).toBe('2024-12-12');
});

test('test getTimes timeUtils', () => {
  let res = getTimes('2024-12-12 00:00', '2024-12-12 23:59', 30, 'minute');
  expect(res.length).toBe(48);
});

test('test isTimeBetween timeUtils', () => {
  let res = isTimeBetween('2024-12-12', ['2024-12-11', '2024-12-13']);
  expect(res).toBe(true);
});

test('test getTimeStartAndEnd timeUtils', () => {
  let res = getTimeStartAndEnd('2024-12-12', 'day');
  expect(
    res[0].time.isSame(dayjs('2024-12-12 00:00'), 'm') &&
      res[1].time.isSame(dayjs('2024-12-12 23:59'), 'm')
  ).toBe(true);
});

test('test isCrossoverTime timeUtils', () => {
  let res1 = isCrossoverTime(['2024-12-12', '2024-12-16'], ['2024-12-13', '2024-12-16'], 'D');
  let res2 = isCrossoverTime(['2024-12-12', '2024-12-16'], ['2024-12-16', '2024-12-18'], 'D');
  let res3 = isCrossoverTime(['2024-12-12', '2024-12-16'], ['2024-12-17', '2024-12-18'], 'D');
  expect([res1, res2, res3]).toEqual([true, true, false]);
});

test('test isContainTimeRange timeUtils', () => {
  let res1 = isContainTimeRange(['2024-12-13', '2024-12-14'], ['2024-12-12', '2024-12-16'], 'D');
  let res2 = isContainTimeRange(
    ['2024-12-13', '2024-12-16'],
    ['2024-12-12', '2024-12-16'],
    'D',
    '[]'
  );
  let res3 = isContainTimeRange(
    ['2024-12-13', '2024-12-16'],
    ['2024-12-12', '2024-12-16'],
    'D',
    '[)'
  );
  let res4 = isContainTimeRange(['2024-12-16', '2024-12-20'], ['2024-12-12', '2024-12-16'], 'D');
  let res5 = isContainTimeRange(['2024-12-18', '2024-12-20'], ['2024-12-12', '2024-12-16'], 'D');
  expect([res1, res2, res3, res4, res5]).toEqual([true, true, false, false, false]);
});

test('test isReturnTime timeUtils', () => {
  expect([isReturnTime(getReturnTime('2024-12-12')), isReturnTime(dayjs('2024-12-12'))]).toEqual([
    true,
    false,
  ]);
});

test('test format timeUtils', () => {
  expect(format(getReturnTime('2024-12-12 12:12'), 'YYYY-MM-DD')).toBe('2024-12-12');
});

test('test getWeekDays timeUtils', () => {
  let cur = dayjs();
  let curWeek = getWeekDays(cur, 1);
  expect(curWeek[0].time.format('YYYY-MM-DD')).toBe(
    dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD')
  );
  expect(curWeek[6].time.format('YYYY-MM-DD')).toBe(
    dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD')
  );
});
