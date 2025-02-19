import './style/index.scss';
import { useMemo, useEffect } from 'preact/compat';
import { cls, createUniqueId, getReturnTime, isAsyncFunction, isFunction, numToPx } from '@/utils';
import Header from '../Header';
import dayjs from 'dayjs';
import { calculateDistance, offsetToTimeValue } from '../_utils';
import { useXState } from '@/hooks';
import { useDragoverBubble } from '../Event/EventColumnLayoutContainer/context';
import { useStore } from '@/contexts/calenderStore';
import type { PropsWithElAttrs } from '@/types/common';
import type { CalenderItem } from '@/types/options';
import type { DragConfig } from '../DragoverBubble/types';
import { TimeIndicateLine, TimeIndicateBar } from '../TimeIndicateBar';
import LayoutContainer from '../LayoutContainer';
import Column from '../Column';
import EventColumnLayoutContainer from '../Event/EventColumnLayoutContainer';
import type { LayoutMouseEvent } from '../Event/types';
import type { MultipleColumnsProps, ViewContentProps } from './types';
import Gridding from './Gridding';

const ViewContent = ({
  timeRangeDays,
  data,
  onChange,
  columnWidth,
  cellHeight = 42,
  interval = 30,
  gap = 8,
}: ViewContentProps) => {
  const { updateDragoverBubbleState } = useDragoverBubble();
  const [_, setColumnData, getColumnData] = useXState(data);
  useEffect(() => setColumnData(data), [data]);

  const handleRectInfo = (e: LayoutMouseEvent, type: 'start' | 'move' | 'end') => {
    const dayStart = timeRangeDays[e.columnIndex];
    const start = getReturnTime(
        dayStart.time.add(offsetToTimeValue(e.y, interval, cellHeight), 'second')
      ),
      end = getReturnTime(
        dayStart.time.add(offsetToTimeValue(e.y + e.h, interval, cellHeight), 'second')
      ),
      title = '',
      config = {
        rect: { ...e },
        data: {
          title,
          start,
          end,
          _key: createUniqueId(),
          _raw: {
            start: start.time.format('YYYY-MM-DD HH:mm:ss'),
            end: end.time.format('YYYY-MM-DD HH:mm:ss'),
            title,
          },
        },
        type: 'add',
      };
    updateDragoverBubbleState(type === 'end' ? null : (config as DragConfig));
    if (type === 'end') {
      onChange({
        target: config.data,
        data: [...getColumnData(), config.data],
      });
    }
  };

  return (
    <EventColumnLayoutContainer
      className={cls(['multiple-columns', 'evnet-columns-container'])}
      cellHeight={cellHeight}
      interval={interval}
      column={timeRangeDays.length}
      onStart={(e) => {
        handleRectInfo(e, 'start');
      }}
      onMove={(e) => {
        handleRectInfo(e, 'move');
      }}
      onEnd={(e) => {
        handleRectInfo(e, 'end');
      }}
    >
      <Gridding
        cellHeight={cellHeight}
        columnWidth={columnWidth}
        columnCount={timeRangeDays.length}
        rowCount={(24 * 60) / interval}
      />
      <div className={cls(['multiple-columns-content'])}>
        {timeRangeDays.map((item, index) => {
          return (
            <Column
              data={data}
              cellHeight={cellHeight}
              timeInterval={interval}
              date={[getReturnTime(item.time.startOf('D')), getReturnTime(item.time.endOf('D'))]}
              onChange={onChange}
              columnIndex={index}
              columnCount={timeRangeDays.length}
              style={columnWidth ? { minWidth: numToPx(columnWidth), flexShrink: 1 } : {}}
              gap={gap}
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

  async function onHeaderChange(event: { target: CalenderItem; data: CalenderItem[] }) {
    onDataChange(event);
  }

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
    return data.filter(({ start, end }) => {
      return !start.time.isSame(end.time, 'D');
    });
  }, [data]);

  function renderTimeIndicateLine() {
    let current = props.days.findIndex((item) => item.time.isSame(dayjs(), 'D'));
    let dotLeft = `calc(100% / ${props.days?.length ?? 1} * ${current})`;
    let top = calculateDistance(
      dayjs().startOf('day'),
      dayjs(),
      layoutConfig.cellHeight,
      layoutConfig.interval
    );

    return current > -1 && <TimeIndicateLine left={dotLeft} top={top} />;
  }
  return (
    <LayoutContainer
      className={cls('multiple-columns')}
      scrollProps={{ hideBar: true }}
      header={
        <Header
          data={data}
          days={props.days}
          columnWidth={layoutConfig.columnWidth}
          headerConfig={layoutConfig.header}
          onChange={onHeaderChange}
        />
      }
      content={
        <ViewContent
          timeRangeDays={props.days}
          data={data}
          onChange={onDataChange}
          cellHeight={layoutConfig.cellHeight}
          interval={layoutConfig.interval}
          gap={layoutConfig.gap}
          columnWidth={layoutConfig.columnWidth}
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
