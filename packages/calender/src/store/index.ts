import { PropsWithChildren } from '@/types/common';
import { createContext, createElement, useRef } from 'preact/compat';
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo } from 'preact/hooks';
import { useXState } from '@/hooks';
import { isUndef } from '@/utils/is';
import Store, { StoreOptions } from './Store';
import { deepClone } from '@/utils';

const isSSR = isUndef(window) || !window.navigator;
const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;
/**
 * @zh 数据共享
 */
export function createStore<State extends Record<string, any>>(
  initialState: State,
  options?: StoreOptions<State>
) {
  const store = Store.create(initialState, options);

  const StoreContext = createContext<State | undefined>(initialState);

  // 共享顶级组件
  function StoreProvider({ children }: PropsWithChildren) {
    const [state, setProviderState, getProvderState] = useXState<State | undefined>(
      store.getState()
    );
    let ob = useCallback((newState: State) => {
      setProviderState(deepClone(newState));
    }, []);
    store.observe(ob);

    return createElement(StoreContext.Provider, { value: state, children });
  }

  // 设置数据
  function setStore(data: State) {
    store.setState(data);
  }

  // 获取store
  function getStore() {
    return store.getState();
  }

  // hooks
  function useStore() {
    const storeCtx = useContext(StoreContext);
    const state = useRef<State | undefined>(storeCtx);

    useIsomorphicLayoutEffect(() => {
      state.current = storeCtx;
    }, [storeCtx]);
    // store 操作
    function getState(key: string) {
      if (state.current) {
        return state.current[key];
      }
      return null;
    }
    function setState(name: string, data: any) {
      if (!isUndef(state.current) && typeof state.current === 'object') {
        store.commit(name, data);
      }
    }
    function clear() {}
    function removeItem() {}

    return {
      getState,
      setState,
      clear,
      removeItem,
      store: storeCtx,
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
    getStore,
  };
}
