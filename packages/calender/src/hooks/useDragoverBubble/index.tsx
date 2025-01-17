import { useEffect, RefObject, createElement } from 'preact/compat';
import DragoverBubble from './DragoverBubble';
import { Bus } from '@/utils/bus';
import { useXState } from '@/hooks';

// 事件key
import { DRAG_MASK_START, DRAG_MASK_MOVE, DRAG_MASK_END } from '@/constant/busEventName';
import type { CalenderItem } from '@/types/options';
import type { Rect, OperateType } from '@/types/components';

export type DragConfig = { rect: Rect; data: CalenderItem; type: OperateType } | null;
/**
 * 作用在整个容器上做统一事件管理
 * 判断遮罩出现的类型：添加，拖动，更改时间长短
 * 通过bus事件将mask信息传入，再通过类型type判断做策略
 */
/**
 * 定位信息，
 * @props colIndex 拖拽的第几列
 * top: 顶部距离
 * w: 宽度
 * h:高度
 */
export const eventBus = new Bus();

export default function useDragoverBubble(contaienr: Element | RefObject<Element>) {
  const [drag, setDrag, getDrag] = useXState<DragConfig | null>(null);

  function onStart(e: DragConfig) {
    setDrag(e);
  }
  function onMove(e: DragConfig) {
    setDrag(e);
  }
  function onEnd() {
    setDrag(null);
  }
  useEffect(() => {
    eventBus.$on(DRAG_MASK_START, onStart);
    eventBus.$on(DRAG_MASK_MOVE, onMove);
    eventBus.$on(DRAG_MASK_END, onEnd);

    return () => {
      eventBus.$off(DRAG_MASK_START, onStart);
      eventBus.$off(DRAG_MASK_MOVE, onMove);
      eventBus.$off(DRAG_MASK_END, onEnd);
    };
  }, []);
  return {
    component: () => createElement(DragoverBubble, { drag }),
    eventBus,
  };
}
