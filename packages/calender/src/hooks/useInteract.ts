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
export type UseInteractTarget = Target | RefObject<Target>;

/**
 * @zh 手势hooks
 */
export default function useInteract(
  target: UseInteractTarget,
  options?: Options,
  eventOptions?: InteractEventOptions,
  callback?: (ctx: Interactable) => void
) {
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
    let el = unref<Target>(target);
    if (el) {
      interactCtx.current = interact(el, options);
      if (eventOptions) {
        initEvent(interactCtx.current, eventOptions);
      }
      callback?.(interactCtx.current);
    }

    return () => {
      interactCtx.current = null;
    };
  }, [target]);
  return {
    getContext: () => interactCtx.current,
  };
}
