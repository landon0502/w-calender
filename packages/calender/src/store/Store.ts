import { isUndef } from '@/utils';

// import { createStore } from './';
export class Store<T> {
  state: T | Record<string, any> = {};

  constructor(initialState: T | undefined) {
    if (!isUndef(initialState)) {
      this.state = initialState;
    }
  }
  getState() {}
  setState() {}
  removeState() {}
  clear() {}
}

export function createStore<State>(initialState: State) {
  let store = new Store(initialState);
  return store;
}
