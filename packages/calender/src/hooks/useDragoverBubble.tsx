import { useEffect, createElement } from 'preact/compat';
import DragoverBubble from '@/components/Event/DragoverBubble';
import { Bus } from '@/utils/bus';
import { useXState } from '@/hooks';

// 事件key
import { SET_DRAG_BUBBLE_DATA } from '@/constant/busEventName';
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
export const dragoverBubbleBusEvent = new Bus();

export function setDragoverBubbleState(event: DragConfig) {
  dragoverBubbleBusEvent.$emit(SET_DRAG_BUBBLE_DATA, event);
}

export default function useDragoverBubble() {
  const [dragover, setDragoverState, getDragoverState] = useXState<DragConfig | null>(null);

  function setLayoutData(e: DragConfig) {
    setDragoverState(e);
  }

  useEffect(() => {
    dragoverBubbleBusEvent.$on(SET_DRAG_BUBBLE_DATA, setLayoutData);
    return () => {
      dragoverBubbleBusEvent.$off(SET_DRAG_BUBBLE_DATA, setLayoutData);
    };
  }, []);

  return {
    component: () => createElement(DragoverBubble, { dragover }),
    dragoverBubbleBusEvent,
    getDragoverState,
    setDragoverBubbleState,
  };
}
