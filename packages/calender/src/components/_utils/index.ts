import { h } from 'preact';
import type { Rect } from '@wcalender/types/components';
import type { DateRange } from '@/types/schedule';
import { getTransform, numToPx, getTimes, getReturnTime } from '@/utils';
import type { CalenderItem } from '@wcalender/types/options';
import { Dayjs } from 'dayjs';
/**
 * @zh 生成样式
 */
export function genStyles({ x, y, h, w }: Rect): h.JSX.CSSProperties {
  let style = getTransform({
    left: numToPx(x, x as string),
    top: numToPx(y),
    width: numToPx(w, w as string),
    height: numToPx(h),
  }) as h.JSX.CSSProperties;
  return style;
}
/**
 * @zh 获取时间列表
 */
export function genTimeSlice(date: DateRange, interval: number) {
  if (!date) {
    return [];
  }
  const [start, end] = date;
  const startTime = getReturnTime(start).time.startOf('day'),
    endTime = getReturnTime(end).time.endOf('day');
  return getTimes(startTime, endTime, interval, 'minute');
}

/**
 * @zh 计算y ,h坐标位置信息
 */
export function calculateRect(
  item: CalenderItem & {
    colIndex: number;
  },
  totalColumn: number,
  colHeight: number,
  containerWidth: number
) {
  const { start, end, colIndex } = item;
  let x = (colIndex / totalColumn) * containerWidth;
  let y = calculateDistance(start.time.startOf('day'), start.time, colHeight);
  let w = containerWidth / totalColumn;
  let h = calculateDistance(start.time, end.time, colHeight);
  return { x, y, w, h };
}

/**
 * @zh 计算时间Y位置
 */
export function calculateDistance(
  start: Dayjs,
  end: Dayjs,
  colHeight: number,
  interval: number = 30
) {
  let timeValue = end.diff(start, 'second');
  return (timeValue / (interval * 60)) * colHeight;
}

/**
 * 计算偏移量转换为时间
 */
export function offsetToTimeValue(offset: number, interval: number, cellHeight: number) {
  return (interval / cellHeight) * 60 * offset;
}
