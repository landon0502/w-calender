import MultipleColumns from '@/components/MultipleColumns';
import { WeekViewProps } from '@/types/components';
import { getDaysByTimes, getTimeStartAndEnd } from '@/utils';

export default function (props: WeekViewProps) {
  return (
    <MultipleColumns {...props} days={getDaysByTimes(...getTimeStartAndEnd(props.date, 'week'))} />
  );
}
