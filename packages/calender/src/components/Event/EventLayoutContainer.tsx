import { h } from 'preact';
import { PropsWithChildren, useRef, useMemo } from 'preact/compat';
import { useDragoverBubble, usePointerMoveEvent } from '@/hooks';
import bus from '@/utils/bus';
import { getReturnTime } from '@/utils';

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

export default function EventLayoutContainer(
  props: PropsWithChildren<{
    className?: string;
    style?: h.JSX.CSSProperties;
    cellHeight: number;
    interval: number;
  }>
) {
  const container = useRef<HTMLDivElement | null>(null);
  const { component: Bubble, setDragoverBubbleState } = useDragoverBubble();

  const dragStepNum = useMemo(() => {
    return (props.cellHeight / props.interval) * 15;
  }, [props.cellHeight, props.interval]);

  let originalLayoutConfig: Rect;
  usePointerMoveEvent(container, {
    onDown({ event }) {
      let { offsetY } = event.originalEvent;
      let top = getMoveEvtDownY(offsetY, props.cellHeight);

      let rect = {
        x: 0,
        y: top,
        w: 180,
        h: dragStepNum,
      };
      originalLayoutConfig = rect;

      //   let record: DragConfig = {
      //     rect,
      //     data: {
      //       title: '添加日程',
      //       start: getReturnTime(
      //         getReturnTime(date[0]).time.add(
      //           offsetToTimeValue(top, props.interval, props.cellHeight),
      //           'second'
      //         )
      //       ),
      //       end: getReturnTime(
      //         getReturnTime(date[0]).time.add(
      //           offsetToTimeValue(top + dragStepNum, props.interval, props.cellHeight),
      //           'second'
      //         )
      //       ),
      //       _key: createUniqueId(),
      //     },
      //     type: 'add',
      //   };
      //   setDragoverBubbleState(record);
    },
    onMove({ dy }) {},
    onUp() {},
  });
  return (
    <div ref={container} className={props.className}>
      <Bubble />
      {props.children}
    </div>
  );
}
