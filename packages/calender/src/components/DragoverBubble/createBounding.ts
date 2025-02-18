import { useEffect, createElement } from 'preact/compat';
import DragoverBubble from '@/components/DragoverBubble';
import { Bus } from '@/utils/bus';
import { useXState } from '@/hooks';
import type { DragConfig } from './types';

export default function createBounding(key: symbol) {
  const dragoverBubbleBusEvent = new Bus();

  function updateDragoverBubbleState(event: DragConfig) {
    dragoverBubbleBusEvent.$emit(key, event);
  }

  function useDragoverBubble() {
    const [dragover, setDragoverState, getDragoverState] = useXState<DragConfig | null>(null);

    function setLayoutData(e: DragConfig) {
      setDragoverState(e);
    }

    useEffect(() => {
      dragoverBubbleBusEvent.$on(key, setLayoutData);
      return () => {
        dragoverBubbleBusEvent.$off(key, setLayoutData);
      };
    }, []);

    return {
      component: () => createElement(DragoverBubble, { dragover }),
      dragoverBubbleBusEvent,
      getDragoverState,
      updateDragoverBubbleState,
    };
  }
  return {
    dragoverBubbleBusEvent,
    useDragoverBubble,
    updateDragoverBubbleState,
  };
}
