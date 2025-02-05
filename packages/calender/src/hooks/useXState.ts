import { RefObject, useRef, useState } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';

type CustomDispath<T> = (state: StateUpdater<T>, callback?: (state: T) => void) => void;
function useXState<T>(initState: T | (() => T)): [T, CustomDispath<T>, () => T, RefObject<T>] {
  const [state, setState] = useState(initState);
  const copyState = useRef(state);

  const setXState: CustomDispath<T> = (state, callback) => {
    setState((prev) => {
      const res = typeof state === 'function' ? (state as (prevState: T) => T)(prev) : state;
      copyState.current = res;
      callback?.(res);
      return res;
    });
  };

  function getState() {
    return copyState.current;
  }

  return [state, setXState, getState, copyState];
}

export default useXState;
