import './style/index.scss';
import { useMemo } from 'preact/compat';
import { cls, getReturnTime, isAsyncFunction, isFunction } from '@/utils';
import Header from './Header';
import dayjs from 'dayjs';
import { calculateDistance } from '../_utils';
import { useDragoverBubble } from '@/hooks';
import { useStore } from '@/contexts/calenderStore';
import type { PropsWithElAttrs } from '@/types/common';
import type { CalenderItem } from '@/types/options';
import type { EventsProps } from '@/types/events';
import type { ReturnTimeValue } from '@/types/time';
import { TimeIndicateLine, TimeIndicateBar } from '../TimeIndicateBar';
import ViewContainer from '../ViewContainer';
import Column from '../Column';
import EventColumnLayoutContainer from '../Event/EventColumnLayoutContainer';
import { Rect } from '@/types/components';

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
  const { setDragoverBubbleState } = useDragoverBubble();

  function handleRectInfo(e: Rect) {
    const startDate = timeRangeDays[0];
    console.log(startDate);
    setDragoverBubbleState({
      rect: { ...e },
      data: {
        title: '',
        start: getReturnTime(dayjs()),
        end: getReturnTime(dayjs()),
        _key: '__',
        _raw: { start: '', end: '', title: 'test' },
      },
      type: 'add',
    });
  }

  return (
    <EventColumnLayoutContainer
      className={cls(['multiple-columns'])}
      cellHeight={cellHeight}
      interval={interval}
      onStart={(e) => {
        handleRectInfo(e);
      }}
      onMove={(e) => {
        handleRectInfo(e);
      }}
      onEnd={(e) => {
        setDragoverBubbleState(null);
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
              style={{ minWidth: '180px', flexShrink: 1 }}
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

  function renderTimeIndicateLine() {
    let current = props.days.findIndex((item) => item.time.isSame(dayjs(), 'D'));
    let dotLeft = `calc(100% / ${props.days?.length ?? 1} * ${current})`;
    return (
      <TimeIndicateLine
        left={dotLeft}
        top={calculateDistance(
          dayjs().startOf('day'),
          dayjs(),
          layoutConfig.cellHeight,
          layoutConfig.interval
        )}
      />
    );
  }
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
      timeIndicateLine={renderTimeIndicateLine()}
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
