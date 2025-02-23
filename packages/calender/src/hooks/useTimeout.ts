import { useCallback, useEffect, useRef } from 'react';
import useMemoizedFn from './useMemoizedFn';
import { isNumber } from '../utils';
import useXState from './useXState';

function useTimeout<T extends (params: any) => any>(
  fn: T,
  defaultParams: Parameters<T>[0],
  delay?: number,
  immediate: boolean = true
) {
  const now = Date.now();
  const [cancelTimestamp, setCancelTimestamp, getCancelTimestamp] = useXState(0);
  const timerCallback = useMemoizedFn(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCancelTimestamp(Date.now() - now);
    return getCancelTimestamp();
  }, []);

  function run(params: Parameters<typeof fn>[0]) {
    if (!isNumber(delay) || delay < 0) {
      return;
    }

    timerRef.current = setTimeout(() => timerCallback(params), delay);
  }

  useEffect(() => {
    if (immediate) {
      run(defaultParams);
    }
    return clear;
  }, [delay]);

  return {
    run,
    clear,
    timerRef,
    cancelTimestamp,
  };
}

export default useTimeout;
