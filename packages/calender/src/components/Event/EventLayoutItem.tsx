import { useRef, Children, useEffect } from 'preact/compat';
import { cls } from '@/utils/css';
import { getAttrsTransformTranslate } from '@/utils/dom';
import type { GridBoxProps, OperateType } from '@wcalender/types/components';
import useInteract from '@/hooks/useInteract';
import { genStyles } from '../_utils';
import { useXState } from '@/hooks';
import { isAsyncFunction, isFunction } from '@/utils';
import { store, commitKeys } from '@/contexts/calenderStore';
/**
 * @zh 获取拖动触发元素信息
 */
function getEleLayout(el: HTMLElement) {
  let posi = getAttrsTransformTranslate(el);
  let { width, height } = el.getBoundingClientRect();
  return { ...posi, w: width, h: height };
}

export default function EventLayoutItem(props: GridBoxProps) {
  const {
    w,
    h,
    x,
    y,
    children,
    className,
    data,
    style,
    disabled = false,
    moveThreshold = {
      x(event) {
        return event.dx;
      },
      y(event) {
        return event.dy;
      },
    },
    onMove,
    onMoveStart,
    onMoveEnd,
    onResize,
    onResizeStart,
    onResizeEnd,
    onTap,
    onBeforeUpdate = () => true,
    edges,
  } = props;

  const moveThresholdX =
    moveThreshold.x ??
    function (event) {
      return event.dx;
    };
  const moveThresholdY =
    moveThreshold.y ??
    function (event) {
      return event.dy;
    };
  const gridBox = useRef<HTMLDivElement>(null);
  const [editType, setDragState] = useXState<OperateType | false>(false);

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

  const { enable, disable } = useInteract(
    gridBox,
    void 0,
    {
      draggableEvents: {
        autoScroll: false,
        origin: 'self',
        listeners: {
          start(event) {
            let rect = getEleLayout(event.target);
            onMoveStart?.(event, data, rect);
            setDragState('move');
          },
          move(event) {
            // get rect of column container element
            let rect = getEleLayout(event.target);
            let dx = moveThresholdX(event);
            let dy = moveThresholdY(event);
            if (dy) {
              onMove?.({ ...event, dy: dy }, data, rect);
              dx = 0;
            }
            if (dx) {
              onMove?.({ ...event, dx: dx }, data, rect);
              dy = 0;
            }
          },
          end(event) {
            let rect = getEleLayout(event.target);
            onMoveEnd?.(event, data, rect);
            resetEditType();
            store.commit(commitKeys.SET_FREEZE_CONTAINER_EVT, false);
          },
        },
      },
      resizeEvents: {
        edges,
        listeners: {
          start(event) {
            let rect = getEleLayout(event.target);
            onResizeStart?.(event, data, rect);
            setDragState('resize');
          },
          move(event) {
            let dy = moveThreshold.y?.(event);
            if (dy) {
              let rect = getEleLayout(event.target);
              onResize?.({ ...event, dy: dy }, data, rect);
            }
            let dx = moveThreshold.x?.(event);
            if (dx) {
              let rect = getEleLayout(event.target);
              onResize?.({ ...event, dx: dx }, data, rect);
            }
          },
          end(event) {
            let rect = getEleLayout(event.target);
            onResizeEnd?.(event, data, rect);
            resetEditType();
            store.commit(commitKeys.SET_FREEZE_CONTAINER_EVT, false);
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

      // set freeze state for the container
      ctx.on('down', function (event) {
        store.commit(commitKeys.SET_FREEZE_CONTAINER_EVT, true);
      });
      ctx.on('up', function (event) {
        store.commit(commitKeys.SET_FREEZE_CONTAINER_EVT, false);
      });
    }
  );

  useEffect(() => {
    disabled ? disable() : enable();
  }, [disabled]);

  return (
    <div
      className={`${className ?? ''} ${cls(['grid-box', 'grid-content'])}`}
      style={{
        ...genStyles({ x, y, h: h, w: w }),
        ...style,
        opacity: editType ? { resize: 0.6, move: 0.6, add: 0 }[editType as OperateType] : 1,
        position: 'absolute',
        overflow: 'hidden',
      }}
      ref={gridBox}
      onClick={() => {}}
    >
      {Children.map(children, (child) => {
        if (typeof child === 'function') {
          return child({ touchState: editType });
        }
        return child;
      })}
    </div>
  );
}
