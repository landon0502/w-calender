import './style/index.scss';
import { useEffect } from 'preact/compat';
import { cls, numToPx } from '@/utils';
import { useXState } from '@/hooks';
import type { TimeList } from '@/types/time';
import { genTimeSlice } from '../_utils';
import { DateRange } from '@/types/schedule';
interface TimeIndicateBarProps {
  data: TimeList;
  cellHeight: number;
  cellWidth: number;
}

export function TimeIndicateBar(props: TimeIndicateBarProps) {
  return (
    <div
      className={cls('time-line')}
      style={{
        '--cell-height': numToPx(props.cellHeight),
        '--cell-width': numToPx(props.cellWidth),
      }}
    >
      {props.data?.map((item, index) => {
        return (
          <div className={cls('time-line-col')}>
            <span className={cls('time-line-col-label')}>{item.start.time.format('HH:mm')}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function (props: {
  range: DateRange;
  interval: number;
  cellHeight: number;
  cellWidth: number;
}) {
  const [timeList, setTimeList] = useXState<TimeList>([]);
  useEffect(() => {
    setTimeList(genTimeSlice(props.range, props.interval));
  }, [props.range]);
  return (
    <TimeIndicateBar data={timeList} cellHeight={props.cellHeight} cellWidth={props.cellWidth} />
  );
}
