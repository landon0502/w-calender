import bus from '@/utils/bus';
import { useEventListener } from '@/hooks';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { isUndef, debounce } from '@/utils';
export type LinkageId = symbol;
export type UseLinkageDirection = 'vertical' | 'horizontal';

type ScrollEvent = Event & { target: HTMLElement };

enum directionEnum {
  horizontal = 'Left',
  vertical = 'Top',
}
export default function useLinkage(
  scrollTarget: Element | HTMLElement | null,
  direction: UseLinkageDirection,
  id?: LinkageId,
  linkage?: Array<LinkageId>
) {
  // current scroll container
  const isActive = useRef<boolean | null>(null);
  const scrollDirection = directionEnum[direction];
  // record the last roll value of the scroll container
  const lastScroll = useRef(0);

  // clear active state
  const onCleanup = useCallback(
    debounce(() => {
      isActive.current = null;
    }, 100),
    [scrollTarget]
  );

  // get roll state for the scroll container
  function isScroll(event: ScrollEvent) {
    return lastScroll.current !== event.target[`scroll${scrollDirection}`];
  }
  function setRollLastValue(target: HTMLElement | Element) {
    lastScroll.current = target[`scroll${scrollDirection}`];
  }

  if (scrollTarget) {
    const onScroll = useCallback(
      (event: ScrollEvent, linkageDirection: UseLinkageDirection) => {
        let target = event.target;

        if (scrollTarget !== target) {
          if (isUndef(isActive.current)) {
            isActive.current = false;
          }

          // Triggers only when the scroll direction is consistent
          if (linkageDirection === direction) {
            scrollTarget[`scroll${scrollDirection}`] = target[`scroll${scrollDirection}`];
          }

          // Cleans up the state of the lienter scrolling container
          onCleanup();
        }
      },
      [scrollTarget]
    );

    useEventListener(
      scrollTarget,
      'scroll',
      function (event: ScrollEvent) {
        if (isUndef(isActive.current)) {
          isActive.current = true;
        } else {
          // Cleans up the state of the current scrolling container
          onCleanup();
        }

        if (isActive.current && isScroll(event)) {
          linkage?.map((linkageKey) => {
            bus.$emit(linkageKey, event, direction);
          });
        }

        setRollLastValue(scrollTarget);
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
