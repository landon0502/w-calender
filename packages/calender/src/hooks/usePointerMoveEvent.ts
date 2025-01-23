import { useRef, RefObject } from 'preact/compat';
import useInteract, { UseInteractTarget } from '@/hooks/useInteract';

import { isUndef } from '@/utils';
import useXState from './useXState';

export type PointerPosition = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};
export type ScrollParent = Element | RefObject<Element>;

export type UsePointerMoveEventOptions = {
  scrollParent?: ScrollParent;
  limitCurrentTarget?: boolean;
  onDown?: (e: { event: any; x: number; y: number }) => void;
  onMove?: (e: { event: any; x: number; y: number; dy: number; dx: number }) => void;
  onUp?: (e: { event: any; x: number; y: number }) => void;
};

const defaultOptions = {
  limitCurrentTarget: true,

  onDown() {},
  onMove() {},
  onUp() {},
};

export function usePointerMoveDistance() {
  let prevMoveY = useRef<number | null | undefined>(),
    dy = useRef(0),
    prevMoveX = useRef<number | null | undefined>(),
    dx = useRef(0);
  function moveThreshold(cur: number, prev: number | null | undefined) {
    if (!isUndef(prev)) {
      return cur - prev;
    }
    return 0;
  }
  return {
    getDXY: (x: number, y: number) => {
      dx.current = moveThreshold(x, prevMoveX.current);
      dy.current = moveThreshold(y, prevMoveY.current);
      prevMoveY.current = y;
      prevMoveX.current = x;

      return {
        dx: dx.current,
        dy: dy.current,
      };
    },
    clearDXY() {
      prevMoveY.current = prevMoveX.current = null;
      dy.current = dx.current = 0;
    },
  };
}

export default function usePointerMoveEvent(
  target: UseInteractTarget,
  options: UsePointerMoveEventOptions = defaultOptions,
  freeze?: () => boolean
) {
  let eventOptions = {
    ...defaultOptions,
    ...options,
  };
  let isTapContainerEle = useRef(false);
  const { getDXY, clearDXY } = usePointerMoveDistance();

  useInteract(target, void 0, void 0, function (ctx) {
    ctx.on('down', function (event) {
      if (freeze?.()) {
        return;
      }
      const { x, y, originalEvent } = event;
      eventOptions.onDown({ event, x, y });
    });
    ctx.on('move', function (event) {
      if (freeze?.()) {
        console.log(freeze?.());
        return;
      }
      const { x, y } = event.originalEvent;
      const { dx, dy } = getDXY(x, y);
      eventOptions.onMove({ event, x, y, dy: dy, dx: dx });
    });
    ctx.on('up', function (event) {
      if (freeze?.()) {
        return;
      }
      const { y, x } = event.originalEvent;
      isTapContainerEle.current = false;
      eventOptions.onUp({ event, x, y });

      clearDXY();
    });
  });
}
