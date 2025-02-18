import { PropsWithChildren } from '@/types/common';
import { createContext, createElement } from 'preact/compat';
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo } from 'preact/hooks';
import { useXState } from '@/hooks';
import { isUndef } from '@/utils/is';
import Store, { StoreOptions } from './Store';

const isSSR = isUndef(window) || !window.navigator;
const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;
/**
 * @zh 数据共享
 */
export function createStore<State>(initialState: State, options?: StoreOptions<State>) {
  const store = Store.create(initialState, options);
  const StoreContext = createContext<State>(initialState);

  // 共享顶级组件
  function StoreProvider({ children }: PropsWithChildren) {
    const [state, setProviderState] = useXState<State>(store.getState());
    let ob = useCallback((newState: State) => {
      setProviderState(() => newState);
    }, []);
    store.observe(ob);

    return createElement(StoreContext.Provider, { value: state, children });
  }

  // 设置数据
  function setStore(data: State) {
    store.setState(data);
  }

  // get store
  function getStore() {
    return store.getState();
  }

  // hooks
  function useStore() {
    const storeCtx = useContext(StoreContext);
    const [state, setRefState, getRefState] = useXState<State>(storeCtx);

    useIsomorphicLayoutEffect(() => {
      setRefState(storeCtx);
    }, [storeCtx]);
    // store 操作
    function getState<K extends keyof State>(key: K): State[K] {
      let state = getRefState();
      return state[key];
    }
    function setState(name: string, data: any) {
      let state = getRefState();
      if (!isUndef(state) && typeof state === 'object') {
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
      store: state,
      StoreContext,
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
    store,
  };
}
