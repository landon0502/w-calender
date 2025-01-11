import { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';
import { elementResizeObserver, ElementRect } from '@/utils/resizeObserver';
import { useXState } from './';
import { unref } from '@/utils/common';
import { isElement } from '@/utils/is';

export default function useElementBounding(
  el?: Element | RefObject<Element>,
  callback?: (e: ElementRect) => void
) {
  const defaultRect = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  };
  const [rect, setRect, getRect] = useXState<ElementRect>({ ...defaultRect });

  let ctx: ReturnType<typeof elementResizeObserver> | null = null;
  useEffect(() => {
    let target = unref(el);
    if (isElement(target)) {
      ctx = elementResizeObserver(
        target,
        (res) => {
          setRect(() => res);
          callback?.(res);
        },
        { immediate: false, windowScroll: false, windowResize: false }
      );
    }

    return () => {
      ctx?.disconnect();
    };
  }, [el]);
  return {
    rect,
    getRect,
  };
}
