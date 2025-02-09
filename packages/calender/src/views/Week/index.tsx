import MultipleColumns from '@/components/MultipleColumns';
import { WeekViewProps } from '@/types/components';
import { getDaysByTimes, getTimeStartAndEnd } from '@/utils';
export default function (props: WeekViewProps) {
  console.log(
    getTimeStartAndEnd(props.date, 'week').map(({ time }) => time.format('YYYY-MM-DD HH:mm'))
  );
  return (
    <MultipleColumns {...props} days={getDaysByTimes(...getTimeStartAndEnd(props.date, 'week'))} />
  );
}
