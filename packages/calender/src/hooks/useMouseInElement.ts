import useInteract from './useInteract';
import { useEffect } from 'preact/compat';
import { RefType } from '@/types/utils';
import { ElementRect } from '@/utils/resizeObserver';
import type { UseInteractTarget } from './useInteract';
import useElementBounding from './useElementBounding';
import useXState from './useXState';
import { getBoundingClientRect, unref } from '@/utils';
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
  target: RefType<HTMLElement | Element | Document | null>,
  options: {
    type?: string;
    handleOutside?: boolean;
    eventTarget?: RefType<HTMLElement | Element | Document | null>;
  }
) {
  const { handleOutside = true, eventTarget } = options;
  const targetRef = unref(eventTarget) ?? unref(target);

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
    isOutside: true,
  });

  useElementBounding(unref(target), ({ left, top, width, height }) => {
    const result = produce(mouseResult, (draftState) => {
      draftState.elementHeight = height;
      draftState.elementWidth = width;
      draftState.elementPositionX = left + (type === 'page' ? window.pageXOffset : 0);
      draftState.elementPositionY = top + (type === 'page' ? window.pageYOffset : 0);
    });
    setMouseResult(result);
  });

  useEffect(() => {
    setMouseResult(
      produce(getMouseResult(), (draftState) => {
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
  }, [target, mouseResult.x, mouseResult.y]);

  useInteract(targetRef as UseInteractTarget, {}, {}, (ctx) => {
    ctx.on('down', function ({ x, y }) {
      setMouseResult(
        produce(getMouseResult(), (drafState) => {
          drafState.x = x;
          drafState.y = y;
        })
      );
    });
    ctx.on('move', function ({ x, y }) {
      setMouseResult(
        produce(getMouseResult(), (drafState) => {
          drafState.x = x;
          drafState.y = y;
        })
      );
    });
    ctx.on('up', function ({ x, y }) {
      setMouseResult(
        produce(getMouseResult(), (drafState) => {
          drafState.x = x;
          drafState.y = y;
        })
      );
      console.log('up', getMouseResult());
    });
  });
  return {
    mouseResult,
    getMouseResult,
  };
}
