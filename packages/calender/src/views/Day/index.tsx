import MultipleColumns from '@/components/MultipleColumns';
import type { DayViewProps } from '@/types/components';
import { getDaysByTimes, getTimeStartAndEnd } from '@/utils';

export default function DayView(
  props: DayViewProps & { cellHeight?: number; interval?: number; gap?: number }
) {
  return (
    <MultipleColumns {...props} days={getDaysByTimes(...getTimeStartAndEnd(props.date, 'day'))} />
  );
}
