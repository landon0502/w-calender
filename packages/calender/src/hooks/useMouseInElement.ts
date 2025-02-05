import useInteract from './useInteract';
import { useEffect } from 'preact/compat';
import { RefType } from '@/types/utils';
import { ElementRect } from '@/utils/resizeObserver';
import type { UseInteractTarget } from './useInteract';
import { PointerEvent } from '@interactjs/types';
import { getBoundingClientRect, unref } from '@/utils';
import { useElementBounding, useXState } from '@/hooks';
import { produce } from 'immer';
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

export interface UseMouseInElementOptions {
  type?: string;
  handleOutside?: boolean;
  eventTarget?: RefType<HTMLElement | Element | Document | null>;
  onDown?: (event: PointerEvent, res: MouseInElementResult) => void;
  onMove?: (event: PointerEvent, res: MouseInElementResult) => void;
  onUp?: (event: PointerEvent, res: MouseInElementResult) => void;
}

export default function useMouseInElement(
  target: RefType<HTMLElement | Element | Document | null>,
  options: UseMouseInElementOptions
) {
  const { handleOutside = true, eventTarget } = options;
  const targetRef = unref(eventTarget) ?? unref(target);

  const type = options.type || 'page';
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

  useElementBounding(unref(target), ({ left, top, width, height }) => {
    setResult(
      produce(getResult(), (draftState) => {
        draftState.elementHeight = height;
        draftState.elementWidth = width;
        draftState.elementPositionX = left + (type === 'page' ? window.pageXOffset : 0);
        draftState.elementPositionY = top + (type === 'page' ? window.pageYOffset : 0);
      })
    );
  });

  useEffect(() => {
    setResult(
      produce(result, (draftState) => {
        const elX = draftState.x - draftState.elementPositionX;
        const elY = draftState.y - draftState.elementPositionY;
        let el = unref(target);

        if (el) {
          const { width, height } = getBoundingClientRect(el as HTMLElement) as ElementRect;
          draftState.isOutside =
            width === 0 || height === 0 || elX < 0 || elY < 0 || elX > width || elY > height;

          if (handleOutside || !draftState.isOutside) {
            draftState.elementX = elX;
            draftState.elementY = elY;
          }
        }
      })
    );
  }, [target, result.x, result.y]);

  function onChange(event: PointerEvent, type: 'onDown' | 'onMove' | 'onUp') {
    setResult(
      produce(getResult(), (draftState) => {
        draftState.x = event.x;
        draftState.y = event.y;
      }),
      function () {
        options[type]?.(event, result);
      }
    );
  }

  useInteract(targetRef as UseInteractTarget, {}, {}, (ctx) => {
    ctx.on('down', function (event: PointerEvent) {
      onChange(event, 'onDown');
    });
    ctx.on('move', function (event: PointerEvent) {
      onChange(event, 'onMove');
    });
    ctx.on('up', function (event: PointerEvent) {
      onChange(event, 'onUp');
    });
  });
  return {
    ...result,
    getResult,
  };
}
