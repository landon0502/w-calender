import { h } from 'preact';
import { PropsWithChildren, useRef, useMemo } from 'preact/compat';
import { useDragoverBubble, usePointerMoveEvent } from '@/hooks';
import bus from '@/utils/bus';
import { getReturnTime, createUniqueId, moveThreshold } from '@/utils';
import { offsetToTimeValue } from '@/components/_utils';
import type { DateRange } from '@/types/schedule';
import type { DragConfig } from '@/hooks/useDragoverBubble';
import type { Rect, OperateType } from '@/types/components';

/**
 * @zh 添加时间段
 * 这里需要做添加元素的resize操作
 * 自动平均对齐刻度
 */
function getMoveEvtDownY(y: number, cellHeight: number) {
  return y - (y % (cellHeight / 2));
}
const getDy = moveThreshold();
export default function EventLayoutContainer(
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
  const { component: Bubble, setDragoverBubbleState } = useDragoverBubble();

  const dragStepNum = useMemo(() => {
    return (props.cellHeight / props.interval) * 15;
  }, [props.cellHeight, props.interval]);

  let originalLayoutConfig: Rect;
  let bubbleRect: Rect | null;
  usePointerMoveEvent(container, {
    onDown({ event }) {
      console.log(event);
      let { offsetY } = event.originalEvent;
      let top = getMoveEvtDownY(offsetY, props.cellHeight);

      bubbleRect = {
        x: 0,
        y: top,
        w: 180,
        h: dragStepNum,
      };
      originalLayoutConfig = bubbleRect;
      props.onStart?.(bubbleRect);
      console.log(bubbleRect);
    },
    onMove({ dy }) {
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
      if (bubbleRect) {
        props.onEnd?.(bubbleRect);
        bubbleRect = null;
      }
    },
  });
  return (
    <div ref={container} className={props.className}>
      <Bubble />
      {props.children}
    </div>
  );
}
