import { h } from 'preact';
import { useEffect, useRef, useMemo, createElement, Children, cloneElement } from 'preact/compat';
import { cls } from '@/utils/css';
import { getAttrsTransformTranslate } from '@/utils/dom';
import { getMoveDistance } from '@/utils/common';
import type { GridBoxProps, OperateType } from '@wcalender/types/components';
import useInteract from '@/hooks/useInteract';
import { genStyles } from '../_utils';
import { useXState } from '@/hooks';
import { isAsyncFunction, isFunction, getBoundingClientRect } from '@/utils';

/**
 * @zh 获取拖动触发元素信息
 */
function getEleLayout(el: HTMLElement) {
  let posi = getAttrsTransformTranslate(el);
  let { width, height } = el.getBoundingClientRect();
  return { ...posi, w: width, h: height };
}
const getDy = getMoveDistance();
const getDx = getMoveDistance();
export default function ScheduleCard({
  w,
  h,
  x,
  y,
  children,
  className,
  data,
  style,
  onMove,
  onMoveStart,
  onMoveEnd,
  onResize,
  onResizeStart,
  onResizeEnd,
  onTap,
  onBeforeUpdate = () => true,
  touchTriggerDistance = { x: 0, y: 0 },
}: GridBoxProps) {
  const gridBox = useRef<HTMLDivElement>(null);
  const [editType, setDragState] = useXState<OperateType | false>(false);
  const [styleConfig, setStyleConfig] = useXState<h.JSX.CSSProperties | null>(null);

  useEffect(() => {
    setStyleConfig(() => genStyles({ x, y, h: h, w: w }));
  }, [w, h, x, y]);

  /**
   * 重置状态
   */
  async function resetEditType() {
    let isAllow =
      isAsyncFunction(onBeforeUpdate) || isFunction(onBeforeUpdate)
        ? await onBeforeUpdate()
        : false;

    if (isAllow) {
      setDragState(false);
    }
  }

  useInteract(
    gridBox,
    void 0,
    {
      draggableEvents: {
        autoScroll: false,
        listeners: {
          start(event) {
            let rect = getEleLayout(event.target);
            onMoveStart?.(event, data, rect);
            setDragState('move');
          },
          move(event) {
            const rect = getBoundingClientRect(event.target);

            let dx = getDx(event.dx, rect?.width ?? 1);
            let dy = getDy(event.dy, touchTriggerDistance.y);
            if (dy) {
              let rect = getEleLayout(event.target);
              onMove?.({ ...event, dy: dy }, data, rect);
              dx = 0;
            }
            if (dx) {
              let rect = getEleLayout(event.target);
              onMove?.({ ...event, dx: dx }, data, rect);
              dy = 0;
            }
          },
          end(event) {
            let rect = getEleLayout(event.target);
            onMoveEnd?.(event, data, rect);
            resetEditType();
          },
        },
      },
      resizeEvents: {
        edges: { top: false, left: false, bottom: true, right: false },
        listeners: {
          start(event) {
            let rect = getEleLayout(event.target);
            onResizeStart?.(event, data, rect);
            setDragState('resize');
          },
          move(event) {
            let dy = getDy(event.dy, touchTriggerDistance.y);
            if (dy) {
              let rect = getEleLayout(event.target);
              onResize?.({ ...event, dy: dy }, data, rect);
            }
          },
          end(event) {
            let rect = getEleLayout(event.target);
            onResizeEnd?.(event, data, rect);
            resetEditType();
          },
        },
      },
    },
    (ctx) => {
      ctx.on('tap', function (event) {
        event.preventDefault();
        event.stopPropagation();
        onTap?.(event, data, { x, y, w, h });
      });
    }
  );

  return (
    <div
      className={`${className ?? ''} ${cls(['grid-box', 'grid-content'])}`}
      style={{
        ...styleConfig,
        ...style,
        opacity: editType ? { resize: 0, move: 0.7, add: 0 }[editType as OperateType] : 1,
      }}
      ref={gridBox}
      onClick={() => {}}
    >
      {Children.map(children, (child) => {
        if (typeof child === 'function') {
          return child({ touchState: editType }); // 调用子元素作为一个函数，并传递值
        }
        return child;
      })}
    </div>
  );
}
