import { useRef, RefObject, useEffect } from 'preact/compat';
import { RefType } from '@/types/utils';
import useMouseInElement from './useMouseInElement';
import { isUndef, execWithDelay } from '@/utils';
import useXState from './useXState';
import { PointerEvent } from '@interactjs/types';

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
  target: RefType<HTMLElement | Element | Document | null>,
  options: UsePointerMoveEventOptions = defaultOptions,
  enable: boolean = true
) {
  const [position, setPosition] = useXState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [_, setEnable, getEnable] = useXState(enable);
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

  const onUp = (
    event: PointerEvent,
    { elementX, elementY }: { elementX: number; elementY: number }
  ) => {
    clearDXY();
    isMove.current = false;
    isDown.current = false;
    if (!getEnable()) return;
    eventOptions.onUp({ event, x: elementX, y: elementY });
    setPosition({ x: elementX, y: elementY });
  };

  useMouseInElement(target, {
    onDown(event, { elementX, elementY, isOutside }) {
      execWithDelay(() => {
        if (!getEnable() || isOutside) return;
        setPosition({ x: elementX, y: elementY });
        eventOptions.onDown({ event, x: elementX, y: elementY });
        isDown.current = true;
      }, options.holdDelay ?? 0);
    },
    onMove(event, { elementX, elementY }) {
      if (!getEnable()) return;
      if (isDown.current) {
        isMove.current = true;
      }

      const { dx, dy } = getDXY(elementX, elementY);
      setPosition({ x: elementX, y: elementY });
      eventOptions.onMove({ event, x: elementX, y: elementY, dy: dy, dx: dx });
    },
    onUp(event, position) {
      if (isMove.current) {
        onUp(event, position);
      } else {
        execWithDelay(() => {
          onUp(event, position);
        }, options.holdDelay ?? 0);
      }
    },
  });

  return {
    position,
  };
}
