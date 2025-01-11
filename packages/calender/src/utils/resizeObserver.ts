import { defaultWindow } from '../constant/_configurable';
import { getBoundingClientRect } from './';
export const isSupportedResizeObserver = defaultWindow && 'ResizeObserver' in defaultWindow;

export type ElementRect = Record<
  'x' | 'y' | 'top' | 'bottom' | 'left' | 'right' | 'width' | 'height',
  number
>;

export interface UseElementBoundingOptions {
  /**
   * Reset values to 0 on component unmounted
   *
   * @default true
   */
  reset?: boolean;

  /**
   * Listen to window resize event
   *
   * @default true
   */
  windowResize?: boolean;
  /**
   * Listen to window scroll event
   *
   * @default true
   */
  windowScroll?: boolean;

  /**
   * Immediately call update on component mounted
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * Timing to recalculate the bounding box
   *
   * Setting to `next-frame` can be useful when using this together with something like {@link useBreakpoints}
   * and therefore the layout (which influences the bounding box of the observed element) is not updated on the current tick.
   *
   * @default 'sync'
   */
  updateTiming?: 'sync' | 'next-frame';
}
/**
 * @zh 监听元素尺寸变化
 * @ch Listens for changes in the size of the element
 */
export function elementResizeObserver(
  target: HTMLElement,
  callback: (config: ElementRect) => void,
  options: UseElementBoundingOptions = {}
) {
  if (!isSupportedResizeObserver) {
    throw new Error('The current environment does not support ResizeObserver！');
  }
  // box mode
  const {
    reset = true,
    windowResize = true,
    windowScroll = true,
    immediate = true,
    updateTiming = 'sync',
  } = options;

  let resizeObserver: ResizeObserver | undefined;

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
  let rect: ElementRect = { ...defaultRect };

  const recalculate = () => {
    const el = target;
    if (!el) {
      if (reset) {
        rect = { ...defaultRect };
      }
      return;
    }
    const elRect = getBoundingClientRect(el);
    if (elRect) {
      rect = {
        bottom: elRect.bottom,
        height: elRect.height,
        left: elRect.left,
        right: elRect.right,
        top: elRect.top,
        width: elRect.width,
        x: elRect.x,
        y: elRect.y,
      };
    }

    callback(rect);
  };

  function update() {
    if (updateTiming === 'sync') recalculate();
    else if (updateTiming === 'next-frame') requestAnimationFrame(() => recalculate());
  }

  resizeObserver = new ResizeObserver(update);
  resizeObserver.observe(target);

  if (immediate) {
    update();
  }

  if (windowScroll) window.addEventListener('scroll', update, { capture: true, passive: true });
  if (windowResize) window.addEventListener('resize', update, { passive: true });
  return {
    resizeObserver,
    observe: resizeObserver.observe,
    unobserve() {
      if (resizeObserver) resizeObserver.unobserve(target);
    },
    disconnect() {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = void 0;
      }
    },
  };
}
