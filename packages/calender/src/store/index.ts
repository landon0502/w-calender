import { PropsWithChildren } from '@/types/common';
import { StateWithActions } from '@/types/store';
import { createContext, createElement, useRef } from 'preact/compat';
import { useContext, useEffect, useLayoutEffect, useMemo } from 'preact/hooks';
import { isUndef } from '@/utils/is';
import Store from './Store';
const isSSR = isUndef(window) || !window.navigator;
const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;
/**
 * @zh 数据共享
 */
export function createStore<State extends StateWithActions>(initialState?: State) {
  const store = new Store(initialState);
  const StoreContext = createContext<State | undefined>(initialState);

  // 共享顶级组件
  function StoreProvider({ children, store }: PropsWithChildren<{ store?: State }>) {
    return createElement(StoreContext.Provider, { value: store, children });
  }

  // 设置数据
  function setStore(store: State) {
    store.setState(store);
  }

  // hooks
  function useStore() {
    const storeCtx = useContext(StoreContext);
    const state = useRef<State | undefined>(storeCtx);

    useIsomorphicLayoutEffect(() => {
      state.current = storeCtx;
    });
    // store 操作
    function getState(key: string) {
      if (state.current) {
        return state.current[key];
      }
      return null;
    }
    function setState(key: keyof State, data: any) {
      if (!isUndef(state.current) && typeof state.current === 'object') {
        state.current[key] = data;
      }
    }
    function clear() {}
    function removeItem() {}

    return {
      getState,
      setState,
      clear,
      removeItem,
    };
  }

  /**
   * For handling often occurring state changes (Transient updates)
   * See more: https://github.com/pmndrs/zustand/blob/master/readme.md#transient-updates-for-often-occuring-state-changes
   */
  const useInternalStore = () => {
    const storeCtx = useContext(StoreContext);

    if (isUndef(storeCtx)) {
      throw new Error('StoreProvider is not found');
    }

    return useMemo(() => storeCtx, [storeCtx]);
  };

  return {
    StoreProvider,
    useStore,
    useInternalStore,
    setStore,
  };
}
