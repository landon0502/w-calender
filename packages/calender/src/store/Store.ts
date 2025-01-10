import { isFunction, isUndef } from '../utils';
import { produce, setAutoFreeze, Draft } from 'immer';

export type Commit<T> = (state: T | Draft<T>, ...args: any[]) => void;
export type Dispatch<T> = (
  event: {
    commit: (name: string, ...args: any[]) => void;
    dispatch: (name: string, ...args: any[]) => void;
    state: T;
  },
  ...args: any[]
) => Promise<void> | void;

export type StoreOptions<State> = {
  mutations?: Record<string, Commit<State>>;
  immediate?: boolean;
  actions?: Record<string, Dispatch<State>>;
};

export default class Store<T extends Record<string, any>> {
  state: T = {} as T;
  private mutations?: Record<string, Commit<T>>;
  private actions?: Record<string, Dispatch<T>>;
  private listener: Set<Function> = new Set();

  constructor(initialState: T, options?: StoreOptions<T>) {
    setAutoFreeze(true);

    this.setState(initialState, options?.immediate);
    if (!isUndef(options)) {
      this.mutations = options.mutations;
      this.actions = options.actions;
    }
  }

  getState() {
    return this.state;
  }

  setState(newState: T, isUpdate: boolean = true) {
    let prevState = this.state;
    this.state = newState;
    if (isUpdate) {
      this.onUpdate(newState, prevState);
    }
  }

  destory() {
    this.mutations = this.actions = void 0;
    this.setState({} as T, false);
    this.listener.clear();
  }

  commit(name: string, ...args: any[]) {
    let that = this;
    let newState = produce(that.state, (draftState) => {
      if (!isUndef(that.mutations)) {
        that.mutations[name](draftState, ...args);
      }
    });
    this.setState(newState);
  }

  async dispatch(name: string, ...args: any[]) {
    if (!isUndef(this.actions)) {
      let action = this.actions[name];
      await action({ commit: this.commit, dispatch: this.dispatch, state: this.state }, ...args);
    }
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
