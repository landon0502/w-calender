import useInteract from './useInteract';
import { RefObject, useRef, useEffect } from 'preact/compat';
import { RefType } from '@/types/utils';
import { ElementRect } from '@/utils/resizeObserver';
import type { UseInteractTarget } from './useInteract';
import useElementBounding from './useElementBounding';
import useXState from './useXState';
import { getBoundingClientRect } from '@/utils';
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

export default function useMouseInElement(
  target: RefType<HTMLElement | Element | null>,
  options: {
    type?: string;
  }
) {
  const type = options.type || 'page';
  const [mouseResult, setMouseResult, getMouseResult] = useXState<MouseInElementResult>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    elementPositionX: 0,
    elementPositionY: 0,
    elementWidth: 0,
    elementHeight: 0,
    isOutside: false,
  });

  useElementBounding(target, ({ left, top, width, height }) => {
    const result = produce(mouseResult, (draftState) => {
      draftState.elementHeight = height;
      draftState.elementWidth = width;
      draftState.elementPositionX = left + (type === 'page' ? window.pageXOffset : 0);
      draftState.elementPositionY = top + (type === 'page' ? window.pageYOffset : 0);
    });
    setMouseResult(result);
  });

  useInteract(target as UseInteractTarget, {}, {}, (ctx) => {
    ctx.on('down', function (event) {
      const { left, top, width, height } = getBoundingClientRect(
        event.interactable.target
      ) as ElementRect;
      console.log('down', event, left, top, width, height);
    });
    ctx.on('move', function (event) {
      console.log('move', event.x, event.y);
    });
    ctx.on('up', function (event) {
      console.log('up', event);
    });
    ctx.on('end', function (event) {
      console.log('end', event);
    });
  });
  return {
    mouseResult,
    getMouseResult,
  };
}
