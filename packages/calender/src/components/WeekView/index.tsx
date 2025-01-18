import './style/index.scss';
import { useMemo, useRef } from 'preact/compat';
import { getWeekDays, cls, getReturnTime, isAsyncFunction, isFunction } from '@/utils';
import { useXState, usePointerMoveEvent } from '@/hooks';
import dayjs from 'dayjs';
import Column from '../Column';
import { useStore } from '@/contexts/calenderStore';
import type { PropsWithElAttrs } from '@/types/common';
import type { CalenderItem } from '@/types/options';
import type { WeekViewProps } from '@/types/components';
import type { ReturnTimeValue } from '@/types/time';

import { TimeIndicateLine, TimeIndicateBar } from '../TimeIndicateBar';
import ViewContainer from '../ViewContainer';
import { calculateDistance } from '../_utils';
import { cellHeight, interval, gap } from '@/constant/_configurable';
import EventLayoutContainer from '../Event/EventLayoutContainer';

const ViewContent = ({
  weekDays,
  data,
  onChange,
  cellHeight = 42,
  interval = 30,
}: {
  weekDays: ReturnTimeValue[];
  data: CalenderItem[];
  cellHeight?: number;
  interval?: number;
  onChange: (event: { target: CalenderItem; data: CalenderItem[] }) => {};
}) => {
  return (
    <EventLayoutContainer
      className={cls(['week-view'])}
      cellHeight={cellHeight}
      interval={interval}
    >
      <div className={cls(['week-view-cols'])}>
        {weekDays.map((item, index) => {
          return (
            <Column
              multipleColumns
              data={data}
              cellHeight={42}
              timeInterval={30}
              date={[getReturnTime(item.time.startOf('D')), getReturnTime(item.time.endOf('D'))]}
              onChange={onChange}
              columnIndex={index}
              columnCount={weekDays.length}
            />
          );
        })}
      </div>
    </EventLayoutContainer>
  );
};

const WeekView = (props: PropsWithElAttrs<WeekViewProps>) => {
  const { store } = useStore();
  const [weekDays] = useXState(getWeekDays(dayjs(), 1));

  const data = useMemo(() => {
    return store?.data ?? [];
  }, [store]);

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
      header={<div style={{ textAlign: 'center' }}>header</div>}
      content={<ViewContent weekDays={weekDays} data={data} onChange={onDataChange} />}
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
};

export default WeekView;
