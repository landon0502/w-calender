import { cls } from '@/utils';
import { ComponentChildren, h, RefObject } from 'preact';
import { createContext, useCallback } from 'preact/compat';
import { useXState } from '@/hooks';
import useScrollLinkage, { LinkageId } from './useScrollLinkage';
import type { RefType } from '@/types/utils';
import './index.scss';

export interface ScrollbarProps {
  children?: ComponentChildren;
  className?: string;
  style?: h.JSX.CSSProperties;
  hideBar?: Boolean;
  linkageId?: LinkageId;
  linkage?: Array<LinkageId>;
  onScroll?: (e: {
    event?: Event;
    scroll: { scrollHeight: number; scrollLeft: number; scrollTop: number; scrollWidth: number };
  }) => void;
}
export const ScrollContext = createContext<{
  el: RefType<HTMLElement | null>;
}>({ el: null });
export default function (props: ScrollbarProps) {
  const [scrollContainer, setScrollContainer, getScrollContainer, scrollContainerRef] =
    useXState<HTMLElement | null>(null);
  useScrollLinkage(scrollContainer, props.linkageId, props.linkage);
  const onScroll = useCallback(
    (e: Event) => {
      if (typeof props.onScroll === 'function') {
        let { scrollHeight, scrollLeft, scrollTop, scrollWidth } = e.target as Element;
        props.onScroll({
          event: e,
          scroll: { scrollHeight, scrollLeft, scrollTop, scrollWidth },
        });
      }
    },
    [props.onScroll]
  );

  return (
    <ScrollContext.Provider
      value={{
        el: scrollContainerRef,
      }}
    >
      <div className={cls(['scrollbar', props.className])} style={props.style}>
        <div
          className={cls(['scrollbar-container', props.hideBar ? 'scrollbar-hide-bar' : void 0])}
          onScroll={onScroll}
          ref={(ctx) => setScrollContainer(ctx)}
        >
          {props.children}
        </div>
      </div>
    </ScrollContext.Provider>
  );
}
