import './style/index.scss';
import { useMemo } from 'preact/compat';
import { cls, getReturnTime, isAsyncFunction, isFunction } from '@/utils';
import Header from './Header';
import dayjs from 'dayjs';
import Column from '../Column';
import { useStore } from '@/contexts/calenderStore';
import type { PropsWithElAttrs } from '@/types/common';
import type { CalenderItem } from '@/types/options';
import type { EventsProps } from '@/types/events';
import type { ReturnTimeValue } from '@/types/time';
import { TimeIndicateLine, TimeIndicateBar } from '../TimeIndicateBar';
import ViewContainer from '../ViewContainer';
import { calculateDistance } from '../_utils';
import EventColumnLayoutContainer from '../Event/EventColumnLayoutContainer';

export interface MultipleColumnsProps extends EventsProps {
  data: CalenderItem[];
  days: ReturnTimeValue[];
}

const ViewContent = ({
  timeRangeDays,
  data,
  onChange,
  cellHeight = 42,
  interval = 30,
  gap = 8,
}: {
  timeRangeDays: ReturnTimeValue[];
  data: CalenderItem[];
  cellHeight?: number;
  interval?: number;
  gap?: number;
  onChange: (event: { target: CalenderItem; data: CalenderItem[] }) => {};
}) => {
  return (
    <EventColumnLayoutContainer
      className={cls(['multiple-columns'])}
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
      <div className={cls(['multiple-columns-content'])}>
        {timeRangeDays.map((item, index) => {
          return (
            <Column
              multipleColumns
              data={data}
              cellHeight={cellHeight}
              timeInterval={interval}
              date={[getReturnTime(item.time.startOf('D')), getReturnTime(item.time.endOf('D'))]}
              onChange={onChange}
              columnIndex={index}
              columnCount={timeRangeDays.length}
            />
          );
        })}
      </div>
    </EventColumnLayoutContainer>
  );
};

const WeekView = (props: PropsWithElAttrs<MultipleColumnsProps>) => {
  const { store, getState } = useStore();

  const data = useMemo(() => {
    return getState('data') ?? [];
  }, [store]);

  const layoutConfig = useMemo(() => {
    return getState('layoutConfig') ?? {};
  }, [getState('layoutConfig')]);

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

  const headerData = useMemo(() => {
    return [];
  }, [data]);
  return (
    <ViewContainer
      className={cls('multiple-columns')}
      scrollProps={{ hideBar: true }}
      header={<Header data={headerData} />}
      content={
        <ViewContent
          timeRangeDays={props.days}
          data={data}
          onChange={onDataChange}
          cellHeight={layoutConfig.cellHeight}
          interval={layoutConfig.interval}
          gap={layoutConfig.gap}
        />
      }
      timeIndicateLine={
        <TimeIndicateLine
          top={calculateDistance(
            dayjs().startOf('day'),
            dayjs(),
            layoutConfig.cellHeight,
            layoutConfig.interval
          )}
        />
      }
      timeIndicateBar={
        <TimeIndicateBar
          range={[dayjs().startOf('day'), dayjs().endOf('day')]}
          interval={layoutConfig.interval}
          cellHeight={layoutConfig.cellHeight}
          cellWidth={72}
        />
      }
    />
  );
};

export default WeekView;
