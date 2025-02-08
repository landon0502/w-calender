import { h } from 'preact';
import { PropsWithChildren, useRef, useMemo } from 'preact/compat';
import { useDragoverBubble, usePointerMoveEvent, useElementBounding } from '@/hooks';
import { moveThreshold } from '@/utils';
import type { Rect } from '@/types/components';
import { useStore } from '@/contexts/calenderStore';
import { PointerEvent } from '@interactjs/types';
/**
 * @zh 添加时间段
 * 这里需要做添加元素的resize操作
 * 自动平均对齐刻度
 */
function getMoveEvtDownY(y: number, cellHeight: number) {
  return y - (y % (cellHeight / 2));
}

const getDy = moveThreshold();

export default function EventColumnLayoutContainer(
  props: PropsWithChildren<{
    cellHeight: number;
    interval: number;
    column: number;
    columnWidth?: number;
    className?: string;
    style?: h.JSX.CSSProperties;
    onStart?: (e: Rect) => void;
    onMove?: (e: Rect) => void;
    onEnd?: (e: Rect) => void;
  }>
) {
  const container = useRef<HTMLDivElement | null>(null);
  const { getRect: getContainerRect } = useElementBounding(container);
  const { component: Bubble } = useDragoverBubble();
  const { getState } = useStore();

  // column width
  function getColumnWidth() {
    if (props.columnWidth) {
      return props.columnWidth;
    }
    return getContainerRect().width / props.column;
  }

  // Movement interval
  const dragStepNum = useMemo(() => {
    return (props.cellHeight / props.interval) * 15;
  }, [props.cellHeight, props.interval]);

  let originalLayoutConfig: Rect;
  let bubbleRect: Rect | null;
  const enable = useRef(false);
  const freezeContainerEventState = useMemo(() => {
    return getState('freezeContainerEvent');
  }, [getState('freezeContainerEvent')]);

  /**
   * @zh 需要计算开始时间和结束时间
   */

  usePointerMoveEvent(
    container,
    {
      holdDelay: 100, // 事件处理延时（ms）
      onDown: ({ x, y }: { event: PointerEvent; x: number; y: number }) => {
        let colWidth = getColumnWidth();

        function getLeft() {
          return Math.floor(x / colWidth) * colWidth;
        }

        let top = getMoveEvtDownY(y, props.cellHeight);

        bubbleRect = {
          x: getLeft(),
          y: top,
          w: colWidth,
          h: dragStepNum,
        };
        originalLayoutConfig = bubbleRect;
        props.onStart?.(bubbleRect);
        enable.current = true;
      },
      onMove({ dy }) {
        if (!enable.current) return;
        let distanceY = getDy(dy, dragStepNum);
        if (distanceY && bubbleRect) {
          originalLayoutConfig.h = originalLayoutConfig.h + distanceY;
          let h = Math.abs(originalLayoutConfig.h);
          let y = 0;
          if (originalLayoutConfig.h > 0) {
            y = bubbleRect.y;
          } else if (originalLayoutConfig.h < 0) {
            y = originalLayoutConfig.y - h;
          } else {
            y = originalLayoutConfig.y;
            h = dragStepNum;
          }
          bubbleRect = {
            ...bubbleRect,
            y: y,
            h,
          };
          props.onMove?.(bubbleRect);
        }
      },
      onUp() {
        if (bubbleRect && enable.current) {
          props.onEnd?.(bubbleRect);
          bubbleRect = null;
        }
        enable.current = false;
      },
    },
    !freezeContainerEventState
  );

  return (
    <div ref={container} className={props.className}>
      <Bubble />
      {props.children}
    </div>
  );
}
