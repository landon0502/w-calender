import './style/index.scss';
import { useMemo } from 'preact/compat';
import Header from './Header';
import Column from '../Column';
import { TimeIndicateLine, TimeIndicateBar } from '../TimeIndicateBar';
import dayjs, { Dayjs } from 'dayjs';
import { useStore } from '@/contexts/calenderStore';
import { cls, isAsyncFunction, isFunction, isContainTimeRange } from '@/utils';
import type { DayViewProps } from '@/types/components';
import type { CalenderItem } from '@/types/options';
import type { ReturnTimeValue } from '@/types/time';
import ViewContainer from '../ViewContainer';
import { calculateDistance } from '../_utils';
import { cellHeight, interval, gap } from '@/constant/_configurable';

function DayView(props: DayViewProps) {
  const { store } = useStore();

  // 这里的数据需统一使用store存储
  // const data = useRef(getState('data'));
  const data = useMemo(() => {
    return store?.data ?? [];
  }, [store]);
  // 头部列表渲染
  const todayData = useMemo(() => {
    return (
      data?.filter(
        (item: { end: ReturnTimeValue; start: ReturnTimeValue }) =>
          !isContainTimeRange([item.start, item.end], props.date, 'minute', '[)')
      ) ?? []
    );
  }, [data]);

  // 数据更改
  async function onDataChange(event: { target: CalenderItem; data: CalenderItem[] }) {
    let allow = true;
    if (isAsyncFunction(props.onBeforeUpdate) || isFunction(props.onBeforeUpdate)) {
      allow = await props.onBeforeUpdate(event);
    }
    if (allow) {
      props.onChange?.(event);
    }
  }
  return (
    <ViewContainer
      className={cls('day')}
      scrollProps={{ hideBar: true }}
      header={<Header data={todayData} />}
      content={
        <Column
          data={data}
          date={props.date}
          cellHeight={cellHeight}
          bordered={false}
          onChange={onDataChange}
        />
      }
      timeIndicateLine={
        <TimeIndicateLine
          top={calculateDistance(dayjs().startOf('day'), dayjs(), cellHeight, interval)}
        />
      }
      timeIndicateBar={
        <TimeIndicateBar
          range={props.date}
          interval={interval}
          cellHeight={cellHeight}
          cellWidth={72}
        />
      }
    />
  );
}

export default DayView;
