import { h } from 'preact';
import { PropsWithChildren, useRef, useMemo, useContext, useEffect } from 'preact/compat';
import { useDragoverBubble, usePointerMoveEvent, useElementBounding } from '@/hooks';
import { moveThreshold, getBoundingClientRect } from '@/utils';
import type { Rect } from '@/types/components';
import { useStore } from '@/contexts/calenderStore';
import { ScrollContext } from '@/components/Scrollbar';
/**
 * @zh 添加时间段
 * 这里需要做添加元素的resize操作
 * 自动平均对齐刻度
 */
function getMoveEvtDownY(y: number, cellHeight: number) {
  return y - (y % (cellHeight / 2));
}

/**
 * 获取布局
 */
function getBubbleLayout(): Rect {
  return {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
}

const getDy = moveThreshold();

/**
 * @zh 获取有效的x,y数值
 */
function getInContainerXYEvtValue(
  containerRect: DOMRect,
  currentPosition: { x: number; y: number }
) {
  console.log(currentPosition);
}

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

  // scroll container
  const scrollContainer = useContext(ScrollContext);
  const { getRect: getScrollContainerRect } = useElementBounding(scrollContainer);
  const { component: Bubble, setDragoverBubbleState } = useDragoverBubble();
  const { getState } = useStore();
  const dragStepNum = useMemo(() => {
    return (props.cellHeight / props.interval) * 15;
  }, [props.cellHeight, props.interval]);

  useEffect(() => {
    console.log(scrollContainer);
  }, [scrollContainer]);

  let originalLayoutConfig: Rect;
  let bubbleRect: Rect | null;
  const enable = useRef(false);
  const freezeContainerEventState = useMemo(() => {
    return getState('freezeContainerEvent');
  }, [getState('freezeContainerEvent')]);

  usePointerMoveEvent(
    container,
    {
      holdDelay: 100,
      onDown({ event, y }) {
        const eventBindTarget = event.interactable.target as HTMLElement;
        let top = getMoveEvtDownY(y, props.cellHeight);

        let bubbleRect =
          getBubbleLayout();
          // y,
          // props.cellHeight,
          // getBoundingClientRect(eventBindTarget),
          // getScrollContainerRect()

        bubbleRect = {
          x: 0,
          y: top,
          w: 180,
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
