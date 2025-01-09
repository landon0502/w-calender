import { deepClone, isFunction, isUndef } from '@/utils';

export default class Store<T> {
  state?: T;
  private mutations?: Record<string, Function>;
  private actions?: Record<string, Function>;
  private listener: Set<Function> = new Set();
  constructor(
    initialState: T,
    options?: { mutations?: Record<string, Function>; immediate: boolean }
  ) {
    if (!options?.immediate) {
      this.state = initialState;
    } else {
      this.setState(initialState);
    }
    if (!isUndef(options)) {
      this.mutations = options.mutations;
    }
  }

  getState() {
    return this.state;
  }
  setState(state: T) {
    console.log('setState');
    let old = deepClone(this.state);
    this.state = state;
    this.onUpdate(state, old);
  }

  setItem() {}
  getItem() {}

  destory() {
    this.state = this.mutations = this.actions = void 0;
    this.listener.clear();
  }

  commit(name: string, ...args: any[]) {
    this.mutations;
  }
  dispatch(name: string, ...args: any[]) {
    this.actions;
  }

  /**
   * 当store数据发生变化事触发
   */
  observe(callback?: Function) {
    if (typeof callback === 'function' && !this.listener.has(callback)) {
      this.listener.add(callback);
    }
  }
  /**
   * 当数据发生变化事触发
   */
  private onUpdate(nextState?: T, prevState?: T) {
    this.listener.forEach((ob) => {
      if (isFunction(ob)) {
        ob(nextState, prevState);
      }
    });
  }
}
