import bus from '@/utils/bus';
import { useEventListener } from '@/hooks';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { isUndef, debounce } from '@/utils';
export type LinkageId = symbol;
export default function useLinkage(
  scrollTarget: Element | HTMLElement | null,
  id?: LinkageId,
  linkage?: Array<LinkageId>
) {
  // current scroll container
  const isActive = useRef<boolean | null>(null);
  if (scrollTarget) {
    const onScroll = useCallback(
      (event: any) => {
        if (scrollTarget !== event.target) {
          if (isUndef(isActive.current)) {
            isActive.current = false;
          }

          scrollTarget.scrollLeft = event.target.scrollLeft;
          scrollTarget.scrollTop = event.target.scrollTop;
        }
      },
      [scrollTarget]
    );

    // clear active state
    const onCleanup = useCallback(
      debounce(() => {
        isActive.current = null;
      }, 100),
      [scrollTarget]
    );

    useEventListener(
      scrollTarget,
      'scroll',
      function (event: any) {
        if (isUndef(isActive.current)) {
          isActive.current = true;
        } else {
          onCleanup();
        }
        if (isActive.current) {
          linkage?.map((id) => bus.$emit(id, event));
        }
      },
      { passive: true }
    );
    if (id && !bus.$has(id, onScroll)) {
      bus.$on(id, onScroll);
    }
    useEffect(() => {
      return () => {
        bus.$off(id, onScroll);
      };
    }, [scrollTarget]);
  }
}
