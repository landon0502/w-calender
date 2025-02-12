import { RefObject, useRef, useEffect } from 'preact/compat';
import interact from 'interactjs';
import type { Options, Target, Listeners, Interactable, EdgeOptions } from '@interactjs/types';
import { unref } from '@/utils/common';
import { isUndef } from '@/utils/is';
export interface InteractEventOptions {
  draggableEvents?: {
    autoScroll?: boolean;
    listeners: Listeners;
    origin?: string;
    inertia?: boolean;
  };
  pointerEvents?: {
    holdDuration?: number;
    ignoreFrom?: string;
    allowFrom?: string;
    origin?: string;
  };
  resizeEvents?: { edges?: EdgeOptions; listeners: Listeners };
}
export type UseInteractTarget = Target | RefObject<Target> | null;

/**
 * @zh 手势hooks
 */
export default function useInteract(
  target: UseInteractTarget,
  options?: Options,
  eventOptions?: InteractEventOptions,
  callback?: (ctx: Interactable) => void
) {
  const enableState = useRef(true);
  let interactCtx = useRef<Interactable | null>(null);

  // 初始化事件
  function initEvent(ctx: Interactable, eventOptions: InteractEventOptions) {
    if (!isUndef(eventOptions?.draggableEvents)) {
      ctx.draggable(eventOptions.draggableEvents);
    }
    if (!isUndef(eventOptions?.pointerEvents)) {
      ctx.pointerEvents(eventOptions.pointerEvents);
    }
    if (!isUndef(eventOptions?.resizeEvents)) {
      ctx.resizable(eventOptions.resizeEvents);
    }
  }

  useEffect(() => {
    let el = unref<Target | null>(target);
    let bindTarget = el;
    if (bindTarget) {
      interactCtx.current = interact(bindTarget, options);
      if (eventOptions) {
        initEvent(interactCtx.current, eventOptions);
      }
      callback?.(interactCtx.current);
      enableState.current ? enable() : disable();
    }

    return () => {
      interactCtx.current = null;
    };
  }, [target]);

  function enable(types: Array<'draggable' | 'resize'> = ['draggable', 'resize']) {
    enableState.current = true;
    if (interactCtx.current) {
      !isUndef(eventOptions?.draggableEvents) &&
        types.includes('draggable') &&
        interactCtx.current.draggable(true);
      !isUndef(eventOptions?.resizeEvents) &&
        types.includes('resize') &&
        interactCtx.current.resizable(true);
    }
  }
  function disable(types: Array<'draggable' | 'resize'> = ['draggable', 'resize']) {
    enableState.current = false;
    if (interactCtx.current) {
      !isUndef(eventOptions?.draggableEvents) &&
        types.includes('draggable') &&
        interactCtx.current.draggable(false);
      !isUndef(eventOptions?.resizeEvents) &&
        types.includes('resize') &&
        interactCtx.current.resizable(false);
    }
  }

  return {
    getContext: () => interactCtx.current,
    disable,
    enable,
  };
}
