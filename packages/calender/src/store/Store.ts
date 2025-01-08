import { isUndef } from '@/utils';

export default class Store<T> {
  private state: T;
  private mutations?: Record<string, Function>;
  private actions?: Record<string, Function>;
  constructor(initialState: T, options?: { mutations?: Record<string, Function> }) {
    this.state = initialState;
    if (!isUndef(options)) {
      this.mutations = options.mutations;
    }
  }
  getState() {
    return this.state;
  }
  setState(state: T) {
    this.state = state;
  }

  removeState() {}
  clear() {}

  commit() {}
  dispatch() {}
}
