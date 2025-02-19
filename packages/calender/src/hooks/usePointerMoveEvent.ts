import { useRef, RefObject, useEffect } from 'preact/compat';
import { RefType } from '@/types/utils';
import useMouseInElement from './useMouseInElement';
import { isElement, isString, isUndef, isContainElement } from '@/utils';
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
  exculdes?: Array<string | Element | HTMLElement>;
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
  useEffect(() => {
    eventOptions = {
      ...defaultOptions,
      ...options,
    };
  }, [options]);
  const isMove = useRef(false),
    isDown = useRef(false);
  const { getDXY, clearDXY } = usePointerMoveDistance();

  useEffect(() => {
    setEnable(() => enable);
  }, [enable]);

  function cleanStatus() {
    clearDXY();
    isMove.current = false;
    isDown.current = false;
  }

  const onUp = (
    event: PointerEvent,
    { elementX, elementY }: { elementX: number; elementY: number }
  ) => {
    cleanStatus();
    if (!getEnable()) return;
    eventOptions.onUp({ event, x: elementX, y: elementY });
    setPosition({ x: elementX, y: elementY });
  };

  function isAllowMouseEvent(event: PointerEvent) {
    let exculdes = options.exculdes ?? [];

    let els: Array<Element | HTMLElement> = [];
    exculdes.forEach((item) => {
      if (isElement(item)) {
        els.push(item);
      }
      if (isString(item)) {
        let elements = document.querySelectorAll(item);
        if (elements.length > 0) {
          els.push(...Array.from(elements));
        }
      }
    });

    let isExculde = els.some((el) => isContainElement(el, event.target as Element));

    return getEnable() && !isExculde;
  }

  // 需要添加exclude
  useMouseInElement(target, {
    onDown(event, { elementX, elementY, isOutside }) {
      if (!isAllowMouseEvent(event) || isOutside) return;
      setPosition({ x: elementX, y: elementY });
      eventOptions.onDown({ event, x: elementX, y: elementY });
      isDown.current = true;
    },
    onMove(event, { elementX, elementY }) {
      if (!isAllowMouseEvent(event)) return;
      if (isDown.current) {
        isMove.current = true;
      }
      const { dx, dy } = getDXY(elementX, elementY);
      setPosition({ x: elementX, y: elementY });
      eventOptions.onMove({ event, x: elementX, y: elementY, dy: dy, dx: dx });
    },
    onUp(event, position) {
      onUp(event, position);
    },
  });

  return {
    position,
  };
}
