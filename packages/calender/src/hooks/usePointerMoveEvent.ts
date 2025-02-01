import { useRef, RefObject, useMemo, useEffect } from 'preact/compat';
import useInteract, { UseInteractTarget } from '@/hooks/useInteract';

import { isUndef, execWithDelay } from '@/utils';
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
  holdDelay?: number;
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

/**
 * @zh 这里处理在元素中的鼠标信息
 * @param target
 * @param options
 * @param enable
 */
export default function usePointerMoveEvent(
  target: UseInteractTarget,
  options: UsePointerMoveEventOptions = defaultOptions,
  enable: boolean = true
) {
  const [positin, setPosition] = useXState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [enableState, setEnable, getEnable] = useXState(enable);
  let eventOptions = {
    ...defaultOptions,
    ...options,
  };
  const isMove = useRef(false),
    isDown = useRef(false);
  const { getDXY, clearDXY } = usePointerMoveDistance();

  useEffect(() => {
    setEnable(() => enable);
  }, [enable]);

  const onUp = (event: any) => {
    clearDXY();
    isMove.current = false;
    isDown.current = false;
    if (!getEnable()) return;
    const { y, x } = event.originalEvent;
    eventOptions.onUp({ event, x, y });
    setPosition({ x, y });
  };

  useInteract(target, {}, { pointerEvents: { origin: 'self' } }, function (ctx) {
    ctx.on('down', function (event) {
      execWithDelay(() => {
        if (!getEnable()) return;
        const { x, y } = event;
        setPosition({ x, y });
        eventOptions.onDown({ event, x, y });
        isDown.current = true;
      }, options.holdDelay ?? 0);
    });
    ctx.on('move', function (event) {
      if (!getEnable()) return;
      if (isDown.current) {
        isMove.current = true;
      }

      const { x, y } = event;
      const { dx, dy } = getDXY(x, y);
      setPosition({ x, y });
      eventOptions.onMove({ event, x, y, dy: dy, dx: dx });
    });
    ctx.on('up', function (event) {
      if (isMove.current) {
        onUp(event);
      } else {
        execWithDelay(() => {
          onUp(event);
        }, options.holdDelay ?? 0);
      }
    });
  });

  return {
    positin,
  };
}
