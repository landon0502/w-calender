import { isAsyncFunction, isFunction } from '@/utils';

/**
 * change event
 */
export async function onChange<T, Callback>(
  event?: T,
  allowUpdate?: Callback,
  change?: (value?: T) => void
) {
  let allow = true;
  if (isAsyncFunction(allowUpdate) || isFunction(allowUpdate)) {
    allow = await allowUpdate(event);
  }
  if (allow) {
    change?.(event);
  }
}
