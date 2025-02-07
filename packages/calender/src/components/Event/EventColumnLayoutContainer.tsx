import { h } from 'preact';
import { PropsWithChildren, useRef, useMemo } from 'preact/compat';
import { useDragoverBubble, usePointerMoveEvent } from '@/hooks';
import { moveThreshold, isUndef } from '@/utils';
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
    className?: string;
    style?: h.JSX.CSSProperties;
    cellHeight: number;
    interval: number;
    onStart?: (e: Rect) => void;
    onMove?: (e: Rect) => void;
    onEnd?: (e: Rect) => void;
  }>
) {
  const container = useRef<HTMLDivElement | null>(null);

  // 这里需要优化，如何将配置跨组件通信
  const { component: Bubble, setDragoverBubbleState } = useDragoverBubble();
  const { getState } = useStore();

  // 移动间隔
  const dragStepNum = useMemo(() => {
    return (props.cellHeight / props.interval) * 15;
  }, [props.cellHeight, props.interval]);

  let originalLayoutConfig: Rect;
  let bubbleRect: Rect | null;
  const enable = useRef(false);
  const freezeContainerEventState = useMemo(() => {
    return getState('freezeContainerEvent');
  }, [getState('freezeContainerEvent')]);

  function getCurrentColumnPosi(x: number) {
    const layoutConfig = getState('layoutConfig');
    const columns = layoutConfig.columns;
    if (!columns) {
      return;
    }

    let columnsLayout = [...columns]
      .sort((a, b) => a.columnIndex - b.columnIndex)
      .map(({ width, columnIndex }) => {
        let foregoingCols = columns.slice(0, columnIndex);
        let left = foregoingCols.reduce((prev, cur) => prev + cur.width, 0);
        return {
          left,
          width,
          columnIndex,
        };
      });
    let cur = columnsLayout.find(({ left, columnIndex }) => {
      return left < x && columnsLayout[columnIndex + 1].left > x;
    });

    return cur;
  }

  /**
   * 需要计算开始时间和结束时间
   */

  usePointerMoveEvent(
    container,
    {
      holdDelay: 100,
      onDown: ({ x, y }: { event: PointerEvent; x: number; y: number }) => {
        let pointerInCol = getCurrentColumnPosi(x);
        if (isUndef(pointerInCol)) {
          return;
        }
        let top = getMoveEvtDownY(y, props.cellHeight);

        bubbleRect = {
          x: pointerInCol.left,
          y: top,
          w: pointerInCol.width,
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
            // 向上扩展
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
