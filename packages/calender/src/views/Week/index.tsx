import MultipleColumns from '@/components/MultipleColumns';
import { WeekViewProps } from '@/types/components';
import { getWeekDays } from '@/utils';

export default function (props: WeekViewProps) {
  return <MultipleColumns {...props} days={getWeekDays(props.date)} />;
}
