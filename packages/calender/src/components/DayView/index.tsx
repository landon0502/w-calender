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
import EventLayoutContainer from '../Event/EventLayoutContainer';

const ViewContent = ({
  data,
  onChange,
  cellHeight = 42,
  interval = 30,
  date,
  gap = 8,
}: DayViewProps & { cellHeight?: number; interval?: number; gap?: number }) => {
  return (
    <EventLayoutContainer
      className={cls(['week-view'])}
      cellHeight={cellHeight}
      interval={interval}
      onStart={(e) => {
        console.log(e);
      }}
      onMove={(e) => {
        console.log(e);
      }}
      onEnd={(e) => {
        console.log(e);
      }}
    >
      <div className={cls(['week-view-cols'])}>
        <Column
          data={data}
          date={date}
          cellHeight={cellHeight}
          bordered={false}
          onChange={onChange}
        />
      </div>
    </EventLayoutContainer>
  );
};

function DayView(props: DayViewProps) {
  const { store, getState } = useStore();

  // 这里的数据需统一使用store存储
  // const data = useRef(getState('data'));
  const data = useMemo(() => {
    return store?.data ?? [];
  }, [store]);
  const layoutConfig = useMemo(() => {
    return getState('layoutConfig') ?? [];
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
        <ViewContent
          data={data}
          date={props.date}
          cellHeight={layoutConfig.cellHeight}
          gap={layoutConfig.gap}
          onChange={onDataChange}
        />
      }
      timeIndicateLine={
        <TimeIndicateLine
          top={calculateDistance(
            dayjs().startOf('day'),
            dayjs(),
            layoutConfig.cellHeight,
            interval
          )}
        />
      }
      timeIndicateBar={
        <TimeIndicateBar
          range={props.date}
          interval={interval}
          cellHeight={layoutConfig.cellHeight}
          cellWidth={72}
        />
      }
    />
  );
}

export default DayView;
