import './style/index.scss';
import { ComponentChildren } from 'preact';
import { useMemo, useRef, forwardRef } from 'preact/compat';
import {
  createUniqueId,
  getMoveDistance,
  setElementStyle,
  getTransform,
  numToPx,
  getReturnTime,
  format,
  cls,
  isEmpty,
  isUndef,
  isNumber,
} from '@/utils';
import { genTimeSlice, calculateRect, offsetToTimeValue, genStyles } from '../_utils';
import type { CalenderItem } from '@/types/options';
import type { DateRange } from '@/types/schedule';
import type { Rect, OperateType } from '@/types/components';
import type { PropsWithElAttrs } from '@/types/common';
import useColumnLayout from './hooks/useColumnLayout';
import { useElementBounding, useXState, usePointerMoveEvent } from '@/hooks';
import EventLayoutItem from '@/components/Event/EventLayoutItem';

export interface ColumnEvent {
  onMoveStart?(event: any, data: CalenderItem, rect: Rect): void;
  onMove?(event: any, data: CalenderItem, rect: Rect): void;
  onMoveEnd?(event: any, data: CalenderItem, rect: Rect): void;
  onResizeStart?(event: any, data: CalenderItem, rect: Rect): void;
  onResize?(event: any, data: CalenderItem, rect: Rect): void;
  onResizeEnd?(event: any, data: CalenderItem, rect: Rect): void;
  onTap?(event: any, data: CalenderItem, rect: Rect): void;
  onChange?(event: { target: CalenderItem; data: CalenderItem[] }): void;
}

export interface ColumnProps extends ColumnEvent {
  data: CalenderItem[];
  date: DateRange;
  multipleColumns?: Boolean;
  columnIndex?: number;
  columnCount?: number;
  scrollTop?: number;
  cellHeight?: number;
  timeInterval?: number;
  gap?: number;
  bordered?: boolean;
  split?: boolean;
}

type DragConfig = { rect: Rect; data: CalenderItem; type: OperateType } | null;
const getDy = getMoveDistance();

export default function Column({
  data,
  date,
  cellHeight = 42,
  timeInterval = 30,
  gap = 0,
  columnIndex = 0,
  columnCount = 1,
  bordered = true,
  split = true,
  multipleColumns = false,
  style = {},
  onChange = () => {},
}: PropsWithElAttrs<ColumnProps>) {
  const layoutContainer = useRef<HTMLDivElement>(null);
  const timeList = useMemo(() => genTimeSlice(date, timeInterval), [date]);
  const columnHeight = useMemo(() => timeList.length * cellHeight, [timeList]);

  let dragPosition: Rect = { x: 0, y: 0, w: '100%', h: 0 };
  let relativeIndex = 0;

  const [dragConfig, setDragConf, getDragState] = useXState<DragConfig>(null);
  const { rect: containerRect, getRect } = useElementBounding(layoutContainer);

  const { layoutData, getCalenderData } = useColumnLayout({
    data,
    timeRange: date,
  });

  const dragStepNum = useMemo(() => {
    return (cellHeight / timeInterval) * 15;
  }, [cellHeight, timeInterval]);

  /**
   * 拖动时的时间
   */
  const dragTime = useMemo(() => {
    if (isUndef(dragConfig)) return null;
    let start = format(dragConfig.data.start, 'YYYY-MM-DD HH:mm');
    let end = format(dragConfig.data.end, 'YYYY-MM-DD HH:mm');
    return { start, end };
  }, [dragConfig]);

  /**
   * @zh 开始移动
   */
  function onMoveStart(event: any, data: CalenderItem, rect: Rect) {
    dragPosition.y = rect.y;
    dragPosition.h = rect.h;
    setDragConf({ rect: { ...dragPosition }, data, type: 'move' });
  }

  /**
   * @zh 移动中
   */
  function onMove(event: any, data: CalenderItem, rect: Rect) {
    if (isNumber(event.dy)) {
      dragPosition.y += event.dy;
    }
    if (dragPosition.y < 0) {
      dragPosition.y = 0;
    }
    let size = getRect();
    if (dragPosition.y + dragPosition.h >= size.height) {
      dragPosition.y = size.height - dragPosition.h;
    }

    let dragEl = document.querySelector(`.${cls('drag-block')}`);

    if (isNumber(event.dx) && multipleColumns) {
      let newIndex = relativeIndex + event.dx / getRect().width;
      if (newIndex + columnIndex >= 0 && newIndex + columnIndex < columnCount) {
        relativeIndex = newIndex;
      }
    }

    if (dragEl) {
      setElementStyle(
        dragEl as HTMLElement,
        getTransform({
          width: '100%',
          height: numToPx(dragPosition.h),
          left: numToPx(0),
          top: numToPx(dragPosition.y),
        })
      );
    }
    handleUpdateData(event, data, 'move');
  }

  function onMoveEnd(event: any, data: CalenderItem) {
    let dragData = getDragState();
    relativeIndex = 0;
    changeData(dragData?.data as CalenderItem);
  }
  /**
   * @zh resize start
   */
  function onResizeStart(event: any, data: CalenderItem, rect: Rect) {
    setDragConf({ rect, data, type: 'resize' });
    dragPosition = { ...rect };
  }

  function onResize(event: any, data: CalenderItem, rect: Rect) {
    let dragEl = document.querySelector(`.${cls('drag-block')}`);
    if (dragEl) {
      let h = event.rect.height;
      setElementStyle(dragEl as HTMLElement, {
        width: '100%',
        height: numToPx(Math.max(h, dragStepNum)),
      });
    }
    handleUpdateData(event, data, 'resize');
  }
  /**
   * @zh 容器大小变更事件
   */
  function onResizeEnd(event: any, data: CalenderItem) {
    let dragData = getDragState();
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
    setDragConf({
      rect: {
        y: dragPosition.y,
        w: '100%',
        x: `calc(${100 * relativeIndex}% + ${relativeIndex}px)`,
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
    setDragConf(null);
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
   * @zh 拖拽样式
   */
  const OperateTime = forwardRef<
    HTMLDivElement,
    { layout: Rect; children?: ComponentChildren; type: OperateType }
  >(({ layout, children, type }, ref) => {
    return (
      <div
        className={cls(['operate-placelholder', `operate-placelholder-${type ?? 'normal'}`])}
        style={genStyles(layout)}
        ref={ref}
      >
        {children}
      </div>
    );
  });

  /**
   * @zh 添加时间段
   * 这里需要做添加元素的resize操作
   * 自动平均对齐刻度
   */
  function getMoveEvtDownY(y: number) {
    return y - (y % (cellHeight / 2));
  }

  /**
   * @zh 鼠标移动事件处理
   */
  let originalLayoutConfig: Rect;
  usePointerMoveEvent(layoutContainer, {
    onDown({ event }) {
      let { offsetY } = event.originalEvent;
      let top = getMoveEvtDownY(offsetY);

      let rect = {
        x: 0,
        y: top,
        w: '100%',
        h: dragStepNum,
      };
      originalLayoutConfig = rect;
      setDragConf({
        rect,
        data: {
          title: '添加日程',
          start: getReturnTime(
            getReturnTime(date[0]).time.add(
              offsetToTimeValue(top, timeInterval, cellHeight),
              'second'
            )
          ),
          end: getReturnTime(
            getReturnTime(date[0]).time.add(
              offsetToTimeValue(top + dragStepNum, timeInterval, cellHeight),
              'second'
            )
          ),
          _key: createUniqueId(),
        },
        type: 'add',
      });
    },
    onMove({ dy }) {
      let newConfig = getDragState();

      if (newConfig) {
        let distanceY = getDy(dy, dragStepNum);
        if (distanceY) {
          originalLayoutConfig.h = originalLayoutConfig.h + distanceY;
          let h = Math.abs(originalLayoutConfig.h);
          let y = 0;
          if (originalLayoutConfig.h > 0) {
            y = newConfig.rect.y;
          } else if (originalLayoutConfig.h < -dragStepNum) {
            y = originalLayoutConfig.y - h;
          } else {
            y = originalLayoutConfig.y - dragStepNum;
            h = dragStepNum;
          }
          let rect = {
            ...newConfig.rect,
            y: y,
            h,
          };
          let [start, end] = [
            getReturnTime(
              getReturnTime(date[0]).time.add(
                offsetToTimeValue(rect.y, timeInterval, cellHeight),
                'second'
              )
            ),
            getReturnTime(
              getReturnTime(date[0]).time.add(
                offsetToTimeValue(rect.y + h, timeInterval, cellHeight),
                'second'
              )
            ),
          ].sort((a, b) => {
            return a.time.isAfter(b.time) ? 1 : -1;
          });
          setDragConf({
            rect,
            data: {
              title: newConfig.data.title,
              start,
              end,
              _key: createUniqueId(),
            },
            type: 'add',
          });
        }
      }
    },
    onUp() {
      let newConfig = getDragState();
      if (newConfig) {
        changeData(newConfig.data);
      }
    },
  });

  /**
   * @zh 渲染模版
   */
  function RenderTemplate({
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
        }}
      >
        {`${config.title}-${format(config.start, 'HH:mm')}~${format(config.end, 'HH:mm')}--${touchState}`}
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
          onMoveStart={onMoveStart}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          onResizeStart={onResizeStart}
          onResizeEnd={onResizeEnd}
          onResize={onResize}
          onTap={onTap}
          style={{ pointerEvents: isEmpty(dragConfig) ? 'auto' : 'none' }}
          touchTriggerDistance={{ y: dragStepNum, x: containerRect.width }}
        >
          {/* 自定义日程卡片，需支持自定义 */}
          {({ touchState }: { touchState: OperateType }) => {
            return <RenderTemplate config={config} touchState={touchState} />;
          }}
        </EventLayoutItem>
      ))
    );
  }
  function renderPlaceholder() {
    if (dragConfig) {
      return (
        <OperateTime layout={dragConfig.rect} type={dragConfig.type}>
          <div style="background: red; height: 100%">
            {/* 这里拖动时显示组件,需支持自定义 */}
            {dragTime?.start}
          </div>
        </OperateTime>
      );
    }
    return null;
  }

  return (
    <div
      style={{
        '--col-h': cellHeight + 'px',
        width: '100%',
        height: numToPx(columnHeight),
        ...style,
      }}
      className={cls([
        'column',
        bordered ? 'column-border' : void 0,
        split ? 'column-split' : void 0,
      ])}
      ref={layoutContainer}
    >
      {renderCalenderLayout()}
      {renderPlaceholder()}
    </div>
  );
}
