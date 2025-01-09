import { isFunction, isUndef } from '@/utils';
import { produce, isDraft } from 'immer';

export type Commit<T> = (state: T, ...args: any[]) => void;
export type Dispatch<T> = (event: {
  commit: Commit<T>;
  dispath: Dispatch<T>;
}) => Promise<void> | void;
export type StoreOptions<State> = {
  mutations?: Record<string, Commit<State>>;
  immediate?: boolean;
  actions?: Record<string, Dispatch<State>>;
};

export default class Store<T extends Record<string, any>> {
  state?: T;
  private mutations?: Record<string, Function>;
  private actions?: Record<string, Function>;
  private listener: Set<Function> = new Set();
  constructor(initialState: T, options?: StoreOptions<T>) {
    this.setState(initialState, options?.immediate);
    if (!isUndef(options)) {
      this.mutations = options.mutations;
      this.actions = options.actions;
    }
  }

  getState() {
    return this.state;
  }

  setState(state: T, isUpdate: boolean = true) {
    let prevState = this.state;
    let newState = produce(state, () => {});
    this.state = newState;
    if (isUpdate) {
      this.onUpdate(newState, prevState);
    }
  }

  destory() {
    this.state = this.mutations = this.actions = void 0;
    this.listener.clear();
  }
  commit(name: string, ...args: any[]) {
    if (isUndef(this.mutations)) {
      return;
    }

    this.mutations[name](this.state, ...args);
  }
  async dispatch(name: string, ...args: any[]) {
    if (isUndef(this.actions)) {
      return;
    }
    let action = this.actions[name];
    await action({ commit: this.commit, dispatch: this.dispatch }, ...args);
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

  /**
   * 创建实例
   */
  static create<T extends Record<string, any>>(initialState: T, options?: StoreOptions<T>) {
    return new Store(initialState, options);
  }
}
