import './style/index.scss';
import type { HeaderConfig, HeaderProps } from './types';
import type { CalenderItem } from '@/types/options';
import type { Rect, OperateType } from '@/types/components';
import { cls } from '@/utils/css';
import Scrollbar from '../Scrollbar';
import { deepMerge, numToPx, isNumber, moveThreshold, getReturnTime } from '@/utils';
import { getWithFunctionValue, offsetToTimeValue } from '../_utils';
import { LAYOUT_CONTENT_KEY, LAYOUT_HEADER_KEY } from '../LayoutContainer/linkageKeys';
import RenderTemplate from '@/templates/RenderTemplate';
import { useTemplateStore } from '@/contexts/templateStore';
import { handleGridCols } from '../Column/hooks/useColumnLayout';
import { useMemo, useRef } from 'preact/hooks';
import { headerDefaultConfig } from './context';
import { DAY_SECOND } from '@/constant/time';
import EventLayoutItem from '../Event/EventLayoutItem';
import { useElementBounding } from '@/hooks';
import { useDragoverBubble } from './context';
import { DAY_MINUTE } from '@/constant/time';

const getDx = moveThreshold();
export default function Header(props: HeaderProps) {
  const { getState } = useTemplateStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const dayCellStyle = props.columnWidth
    ? { minWidth: numToPx(props.columnWidth), flexShrink: 1 }
    : {};
  const containerWidth = props.columnWidth
    ? numToPx(props.days.length * props.columnWidth)
    : '100%';
  const data = useMemo(() => {
    let headerData = props.data.filter(({ start, end }) => {
      return !start.time.isSame(end.time, 'D');
    });
    return handleGridCols(headerData);
  }, [props.data]);
  const totalRowCount = Math.max(...data.map((item) => item.totalColumn));
  const headerConfig = deepMerge(headerDefaultConfig, props.headerConfig) as Required<HeaderConfig>;
  const { rect: containerRect, getRect: getContainerRect } = useElementBounding(containerRef);
  const { component: Bubble, updateDragoverBubbleState, getDragoverState } = useDragoverBubble();

  // drag time interval
  const timeInterval = 4;

  /**
   * @zh 计算y ,h坐标位置信息
   */
  function calculateRect(
    item: CalenderItem & {
      colIndex: number;
    }
  ) {
    const { barHeight, gap } = headerConfig;
    const totalSecond = props.days.length * DAY_SECOND; // s
    const { start, end, colIndex } = item;
    const currentSecond = end.time.diff(start.time, 'second');

    let x = (start.time.diff(props.days?.[0].time, 'second') / totalSecond) * containerRect.width;
    let y = colIndex * (barHeight + gap);
    let w = (currentSecond / totalSecond) * containerRect.width - gap;
    let h = barHeight;

    return { x, y, w, h };
  }

  // 渲染头部时间指示
  function renderDays() {
    function renderItem() {
      return props.days?.map((item) => {
        return (
          <div
            className={cls(['header-rows-days-item', 'header-rows-boder-gridcell'])}
            style={dayCellStyle}
          >
            <RenderTemplate data={{ date: item }} template={getState('templates').dayCell} />
          </div>
        );
      });
    }
    return <div className={cls(['header-rows-days'])}>{renderItem()}</div>;
  }

  /**
   * @zh 开始移动
   * @en move start
   */
  let dragPosition: Rect = { x: 0, y: 0, w: 0, h: 0 };
  function onMoveStart(event: any, data: CalenderItem, rect: Rect) {
    dragPosition.w = rect.w;
    dragPosition.y = rect.y;
    dragPosition.x = rect.x;
    dragPosition.h = headerConfig.barHeight;
    updateDragoverBubbleState({
      rect: { ...dragPosition },
      data,
      type: 'move',
    });
  }

  /**
   * @zh 移动中
   * @en moved
   */
  function onMove(event: any, data: CalenderItem, rect: Rect) {
    if (isNumber(event.dx)) {
      dragPosition.x += event.dx;
    }
    handleUpdateData(event, data, 'move');
  }

  function onMoveEnd() {
    let dragData = getDragoverState();
    changeData(dragData?.data as CalenderItem);
    updateDragoverBubbleState(null);
  }

  /**
   * @zh 处理数据
   */
  function handleUpdateData(event: any, data: CalenderItem, type: OperateType) {
    const columnWidth = getContainerRect().width / (props.days.length || 1);
    let newWidth = event.rect.width;
    let currentDragData = { ...data };
    let start = props.days[0];
    currentDragData.start = getReturnTime(
      getReturnTime(start).time.add(
        offsetToTimeValue(dragPosition.x as number, DAY_MINUTE, columnWidth),
        'second'
      )
    );

    let endPosi = (dragPosition.x as number) + newWidth;
    currentDragData.end = getReturnTime(
      getReturnTime(start).time.add(offsetToTimeValue(endPosi, DAY_MINUTE, columnWidth), 'second')
    );

    updateDragoverBubbleState({
      rect: {
        y: dragPosition.y,
        w: newWidth,
        x: dragPosition.x,
        h: dragPosition.h,
      },
      data: currentDragData,
      type: type,
    });
  }

  /**
   * @zh resize start
   */
  function onResizeStart(event: any, data: CalenderItem, rect: Rect) {
    updateDragoverBubbleState({
      rect: { ...rect, h: headerConfig.barHeight },
      data,
      type: 'resize',
    });
    dragPosition = { ...rect };
  }

  function onResize(event: any, data: CalenderItem) {
    handleUpdateData(event, data, 'resize');
  }
  /**
   * @zh 容器大小变更事件
   */
  function onResizeEnd(event: any, data: CalenderItem) {
    let dragData = getDragoverState();
    changeData(dragData?.data as CalenderItem);
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
    let data = [...props.data];
    let index = data.findIndex((item) => item._key === target._key);
    if (index > -1) {
      data[index] = target;
    } else {
      data = [...data, target];
    }
    let result = { target: target, data };
    props.onChange?.(result);
  }

  // 渲染头部的时间栏
  function renderData() {
    const height = totalRowCount * headerConfig.barHeight + headerConfig.gap * totalRowCount - 1;
    const style = {
      height: numToPx(height),
    };

    const dayCols = props.days?.map(() => {
      return (
        <div
          className={cls(['header-rows-presentation-gridcell', 'header-rows-boder-gridcell'])}
          style={{ ...dayCellStyle, height: '100%' }}
        ></div>
      );
    });

    const bars = data.map((group) =>
      group.data.map(({ colIndex, ...config }) => {
        let rect = calculateRect({ ...config, colIndex });
        return (
          <EventLayoutItem
            key={config._key}
            data={config}
            {...rect}
            className={cls('header-rows-bars-item')}
            style={getWithFunctionValue(headerConfig.style)}
            edges={{ top: false, left: false, bottom: false, right: true }}
            onMoveStart={onMoveStart}
            onMove={onMove}
            onMoveEnd={onMoveEnd}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            onResize={onResize}
            moveThreshold={{
              x(event) {
                return getDx(
                  event.dx,
                  (getContainerRect().width / (props.days.length || 1) / 24) * timeInterval
                );
              },
              y() {
                return false;
              },
            }}
          >
            <RenderTemplate
              data={{
                config,
              }}
              template={() => <div></div>}
            />
          </EventLayoutItem>
        );
      })
    );

    return (
      <>
        <div className={cls(['header-rows-data'])} style={style}>
          <Bubble />
          <div className={cls('header-rows-presentation')}>{dayCols}</div>
          <div className={cls('header-rows-bars')}>{bars}</div>
        </div>
      </>
    );
  }

  return (
    <div className={cls('header')}>
      <div className={cls('header-date')}></div>
      <Scrollbar
        className={cls('header-rows')}
        hideBar
        linkageId={LAYOUT_HEADER_KEY}
        horizontalLinkage={[LAYOUT_CONTENT_KEY]}
      >
        <div style={{ width: containerWidth }} ref={containerRef}>
          {renderDays()}
          {renderData()}
        </div>
      </Scrollbar>
    </div>
  );
}
