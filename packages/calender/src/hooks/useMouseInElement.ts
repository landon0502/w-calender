import useInteract from './useInteract';
import { useEffect, useRef } from 'preact/compat';
import { RefType } from '@/types/utils';
import { ElementRect } from '@/utils/resizeObserver';
import type { UseInteractTarget } from './useInteract';
import { PointerEvent } from '@interactjs/types';
import { getBoundingClientRect, unref } from '@/utils';
import { useXState } from '@/hooks';
import { produce } from 'immer';
import useEventListener from './useEventListener';
export type MouseInElementResult = {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  elementPositionX: number;
  elementPositionY: number;
  elementWidth: number;
  elementHeight: number;
  isOutside: boolean;
};

const UseMouseBuiltinExtractors: Record<UseMouseCoordType, UseMouseEventExtractor> = {
  page: (event) => [event.pageX, event.pageY],
  client: (event) => [event.clientX, event.clientY],
  screen: (event) => [event.screenX, event.screenY],
  movement: (event) => (event instanceof Touch ? null : [event.movementX, event.movementY]),
} as const;

export type UseMouseCoordType = 'page' | 'client' | 'screen' | 'movement';
export type UseMouseEventExtractor = (
  event: PointerEvent
) => [x: number, y: number] | null | undefined;

export interface UseMouseInElementOptions {
  type?: UseMouseCoordType | (() => [number, number]);
  handleOutside?: boolean;
  scroll?: boolean;
  eventTarget?: RefType<HTMLElement | Element | Document | null>;
  onDown?: (event: PointerEvent, res: MouseInElementResult) => void;
  onMove?: (event: PointerEvent, res: MouseInElementResult) => void;
  onUp?: (event: PointerEvent, res: MouseInElementResult) => void;
}

export default function useMouseInElement(
  target: RefType<HTMLElement | Element | Document | null>,
  options: UseMouseInElementOptions
) {
  const { eventTarget, scroll = true } = options;
  const targetRef = unref(eventTarget) ?? unref(target);
  const type = options.type || 'page';

  // Record the last scroll data
  const _prevScrollX = useRef(0);
  const _prevScrollY = useRef(0);
  const _prevMouseEvent = useRef<PointerEvent | null>(null);

  const extractor = typeof type === 'function' ? type : UseMouseBuiltinExtractors[type];

  const [result, setResult, getResult] = useXState<MouseInElementResult>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    elementPositionX: 0,
    elementPositionY: 0,
    elementWidth: 0,
    elementHeight: 0,
    isOutside: true,
  });

  useEffect(() => {
    setResult(
      produce(result, (draftState) => {
        let el = unref(target);

        if (el) {
          const { width, height, left, top } = getBoundingClientRect(
            el as HTMLElement
          ) as ElementRect;
          draftState.elementHeight = height;
          draftState.elementWidth = width;
          draftState.elementPositionX = left + (type === 'page' ? window.pageXOffset : 0);
          draftState.elementPositionY = top + (type === 'page' ? window.pageYOffset : 0);

          const elX = draftState.x - draftState.elementPositionX;
          const elY = draftState.y - draftState.elementPositionY;
          draftState.isOutside =
            width === 0 || height === 0 || elX < 0 || elY < 0 || elX > width || elY > height;

          if (!draftState.isOutside) {
            draftState.elementX = elX;
            draftState.elementY = elY;
          }
        }
      })
    );
  }, [target, result.x, result.y]);

  function onChange(event: PointerEvent, type: 'onDown' | 'onMove' | 'onUp') {
    const position = extractor(event);
    if (!position) {
      return;
    }
    setResult(
      produce(getResult(), (draftState) => {
        [draftState.x, draftState.y] = position;
      }),
      function (res) {
        options[type]?.(event, res);
      }
    );
  }

  // handler scroll
  const scrollHandler = () => {
    if (!_prevMouseEvent.current || !window) return;
    const pos = extractor(_prevMouseEvent.current);
    if (_prevMouseEvent.current?.originalEvent instanceof MouseEvent && pos) {
      setResult(
        produce(getResult(), (draftState) => {
          draftState.x = pos[0] + window.scrollX - _prevScrollX.current;
          draftState.y = pos[1] + window.scrollY - _prevScrollY.current;
        })
      );
    }
  };
  if (target) {
    const listenerOptions = { passive: true };
    if (scroll && type === 'page')
      useEventListener(window, 'scroll', scrollHandler, listenerOptions);
  }
  const { enable, disable } = useInteract(targetRef as UseInteractTarget, {}, {}, (ctx) => {
    ctx.on('down', function (event: PointerEvent) {
      onChange(event, 'onDown');
    });
    ctx.on('move', function (event: PointerEvent) {
      _prevMouseEvent.current = event;
      if (window) {
        _prevScrollX.current = window.scrollX;
        _prevScrollY.current = window.scrollY;
      }
      onChange(event, 'onMove');
    });
    ctx.on('up', function (event: PointerEvent) {
      onChange(event, 'onUp');
    });
  });
  return {
    ...result,
    getResult,
    disable,
    enable,
  };
}
