import './style/index.scss';
import type { ColumnProps } from './types';
import type { CalenderItem } from '@/types/options';
import type { Rect, OperateType } from '@/types/components';
import type { PropsWithElAttrs } from '@/types/common';
import { useMemo, useRef } from 'preact/compat';
import { numToPx, getReturnTime, format, cls, isEmpty, isNumber, moveThreshold } from '@/utils';
import { genTimeSlice, calculateRect, offsetToTimeValue } from '../_utils';
import useColumnLayout from './hooks/useColumnLayout';
import { useElementBounding } from '@/hooks';
import EventLayoutItem from '@/components/Event/EventLayoutItem';
import { useDragoverBubble } from '../Event/EventColumnLayoutContainer/context';
import { useGetEventColumnLayoutContext } from '../Event/EventColumnLayoutContainer';
import dayjs from 'dayjs';
import { calenderLayoutItemClassName } from './contexts';

const getDy = moveThreshold();

export default function Column({
  data,
  date,
  cellHeight = 42,
  timeInterval = 30,
  gap = 0,
  columnIndex = 0,
  columnCount = 1,
  style = {},
  onChange = () => {},
}: PropsWithElAttrs<ColumnProps>) {
  let dragPosition: Rect = { x: 0, y: 0, w: 0, h: 0 };
  let relativeIndex = 0;
  const layoutContainer = useRef<HTMLDivElement>(null);
  const timeList = useMemo(() => genTimeSlice(date, timeInterval), [date]);
  const columnHeight = useMemo(() => timeList.length * cellHeight, [timeList]);
  const { updateDragoverBubbleState, getDragoverState } = useDragoverBubble();
  const { rect: containerRect, getRect: getContainerRect } = useElementBounding(layoutContainer);
  const { getColumnWidth } = useGetEventColumnLayoutContext();
  const { layoutData, getCalenderData } = useColumnLayout({
    data,
    timeRange: date,
  });

  const dragStepNum = useMemo(() => {
    return (cellHeight / timeInterval) * 15;
  }, [cellHeight, timeInterval]);

  /**
   * @zh 开始移动
   * @en move start
   */
  function onMoveStart(event: any, data: CalenderItem, rect: Rect) {
    dragPosition.y = rect.y;
    dragPosition.x = getColumnWidth() * columnIndex;
    dragPosition.h = rect.h;
    updateDragoverBubbleState({
      rect: { ...dragPosition, w: getColumnWidth() },
      data,
      type: 'move',
    });
  }

  /**
   * @zh 移动中
   * @en moved
   */
  function onMove(event: any, data: CalenderItem, rect: Rect) {
    const columnWidth = getColumnWidth();
    const containerRect = getContainerRect();
    if (isNumber(event.dy)) {
      dragPosition.y += event.dy;
    }
    if (dragPosition.y < 0) {
      dragPosition.y = 0;
    }

    if (dragPosition.y + dragPosition.h >= containerRect.height) {
      dragPosition.y = containerRect.height - dragPosition.h;
    }
    const { x } = event.page;

    relativeIndex = Math.floor((x + rect.x) / columnWidth);
    if (relativeIndex < -columnIndex) {
      relativeIndex = -columnIndex;
    } else if (relativeIndex + columnIndex > columnCount - 1) {
      relativeIndex = columnCount - 1 - columnIndex;
    }

    handleUpdateData(event, data, 'move');
  }

  function onMoveEnd() {
    let dragData = getDragoverState();
    relativeIndex = 0;
    changeData(dragData?.data as CalenderItem);
  }
  /**
   * @zh resize start
   */
  function onResizeStart(event: any, data: CalenderItem, rect: Rect) {
    updateDragoverBubbleState({
      rect: { ...rect, w: getColumnWidth(), x: getColumnWidth() * columnIndex },
      data,
      type: 'resize',
    });
    dragPosition = { ...rect };
  }

  function onResize(event: any, data: CalenderItem, rect: Rect) {
    handleUpdateData(event, data, 'resize');
  }
  /**
   * @zh 容器大小变更事件
   */
  function onResizeEnd() {
    let dragData = getDragoverState();
    changeData(dragData?.data as CalenderItem);
  }

  /**
   * @zh 处理数据
   */
  function handleUpdateData(event: any, data: CalenderItem, type: OperateType) {
    let currentDragData = { ...data };
    currentDragData.start = getReturnTime(
      getReturnTime(date[0])
        .time.add(offsetToTimeValue(dragPosition.y, timeInterval, cellHeight), 'second')
        .add(relativeIndex, 'day')
    );

    currentDragData.end = getReturnTime(
      getReturnTime(date[0])
        .time.add(
          offsetToTimeValue(dragPosition.y + event.rect.height, timeInterval, cellHeight),
          'second'
        )
        .add(relativeIndex, 'day')
    );

    updateDragoverBubbleState({
      rect: {
        y: dragPosition.y,
        w: getContainerRect().width,
        x: numToPx(getContainerRect().width * (columnIndex + relativeIndex)),
        h: event.rect.height,
      },
      data: currentDragData,
      type: type,
    });
  }

  /**
   * @zh 数据更新事件
   */
  async function changeData(data: CalenderItem) {
    await updateData(data);
    updateDragoverBubbleState(null);
  }

  /**
   * @zh 更新数据
   */
  async function updateData(target: CalenderItem) {
    let data = [...getCalenderData()];
    let index = data.findIndex((item) => item._key === target._key);
    if (index > -1) {
      data[index] = target;
    } else {
      data = [...data, target];
    }
    let result = { target: target, data };
    onChange(result);
  }

  const onTap = () => {};

  /**
   * @zh 渲染模版
   */
  function renderTemplate({
    touchState,
    config,
  }: {
    touchState?: OperateType;
    config: CalenderItem;
  }) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'blue',
          fontSize: '12px',
          color: 'white',
          userSelect: touchState ? 'auto' : 'none',
        }}
      >
        <div style={{ height: '50%' }}>
          <div style={{ height: '50%', background: 'red' }}>
            {`${config.title}-${format(config.start, 'HH:mm')}~${format(config.end, 'HH:mm')}--${touchState}`}
          </div>
        </div>
      </div>
    );
  }

  /**
   * @zh 日程布局
   */
  function renderCalenderLayout() {
    if (isEmpty(layoutData)) {
      return null;
    }
    return layoutData.map((group) =>
      group.data.map(({ colIndex, ...config }) => (
        <EventLayoutItem
          {...calculateRect(
            { ...config, colIndex },
            group.totalColumn,
            cellHeight,
            containerRect.width
          )}
          key={config._key}
          data={config}
          edges={{ top: false, left: false, bottom: true, right: false }}
          onMoveStart={onMoveStart}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
          onResize={onResize}
          onTap={onTap}
          moveThreshold={{
            y(event) {
              return getDy(event.dy, dragStepNum);
            },
          }}
          className={calenderLayoutItemClassName}
        >
          {/* 自定义日程卡片，需支持自定义 */}
          {({ touchState }: { touchState: OperateType }) => {
            return renderTemplate({ config, touchState });
          }}
        </EventLayoutItem>
      ))
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: numToPx(columnHeight),
        ...style,
      }}
      className={cls([
        'column',
        getReturnTime(date[0]).time.isSame(dayjs(), 'day') ? 'today-active' : void 0,
      ])}
      ref={layoutContainer}
    >
      {renderCalenderLayout()}
    </div>
  );
}
