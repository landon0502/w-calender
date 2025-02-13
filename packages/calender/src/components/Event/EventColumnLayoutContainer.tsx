import { PropsWithChildren, useRef, useMemo, createContext } from 'preact/compat';
import { useDragoverBubble, usePointerMoveEvent, useElementBounding } from '@/hooks';
import { moveThreshold } from '@/utils';
import { useStore } from '@/contexts/calenderStore';
import { PointerEvent } from '@interactjs/types';
import type { EventColumnLayoutContainerProps, LayoutMouseEvent } from './types';

/**
 * @zh 添加时间段
 */
function getMoveEvtDownY(y: number, cellHeight: number) {
  return y - (y % (cellHeight / 2));
}

const getDy = moveThreshold();

export const EventColumnLayoutContext = createContext<{ getColumnWidth: () => number }>({
  getColumnWidth() {
    return 0;
  },
});
export default function EventColumnLayoutContainer(
  props: PropsWithChildren<EventColumnLayoutContainerProps>
) {
  const container = useRef<HTMLDivElement | null>(null);
  const { getRect: getContainerRect } = useElementBounding(container);
  const { component: Bubble } = useDragoverBubble();
  const { getState } = useStore();

  // column width
  function getColumnWidth() {
    return getContainerRect().width / props.column;
  }

  // Movement interval
  const dragStepNum = useMemo(() => {
    return (props.cellHeight / props.interval) * 15;
  }, [props.cellHeight, props.interval]);

  let originalLayoutConfig: LayoutMouseEvent;
  let bubbleRect: LayoutMouseEvent | null;
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
        function getColumnIndex() {
          let colIndex = Math.floor(x / colWidth);
          return colIndex;
        }

        let top = getMoveEvtDownY(y, props.cellHeight);
        let columnIndex = getColumnIndex();
        bubbleRect = {
          x: columnIndex * colWidth,
          y: top,
          w: colWidth,
          h: dragStepNum,
          columnIndex,
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
    !freezeContainerEventState && !props.disabled
  );
  return (
    <EventColumnLayoutContext.Provider value={{ getColumnWidth }}>
      <div ref={container} className={props.className}>
        <Bubble />
        {props.children}
      </div>
    </EventColumnLayoutContext.Provider>
  );
}
