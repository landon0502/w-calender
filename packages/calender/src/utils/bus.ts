import { isEmpty, isUndef } from './is';
export type EventCallback = (...e: any) => void;

export interface BusInterface {
  $emit(evt: symbol, ...args: any): void;
  $on(evt: symbol, callback: EventCallback, autoTrigger: boolean): void;
  $once(evt: symbol, callback: EventCallback, autoTrigger: boolean): void;
  $off: (evt: symbol, callback: EventCallback) => void;
  $clear(): void;
}

/**
 * @zh 全局事件
 */
export class Bus implements BusInterface {
  private events: {
    [propname: symbol]: Array<EventCallback>;
  } = {};
  private taskCallBackCache: {
    [propname: symbol]: any;
  } = {};
  /**
   * 绑定监听函数
   * evt: 事件
   * callback: 绑定函数
   * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
   */
  $on(evt: symbol, callback: EventCallback, autoTrigger = false) {
    if (!this.events[evt]) this.events[evt] = [];
    this.events[evt].push(callback);
    if (Reflect.has(this.taskCallBackCache, evt)) {
      autoTrigger && this.$emit(evt, ...this.taskCallBackCache[evt]);
      delete this.taskCallBackCache[evt];
    }
    return this;
  }
  // 发布事件
  $emit(evt: symbol, ...payload: any) {
    const callbacks = this.events[evt];
    if (callbacks) {
      callbacks.forEach((cb) => cb.apply(this, payload));
    } else {
      // 对在$emit后绑定的$on，先缓存参数，等绑定后再调用
      this.taskCallBackCache[evt] = payload;
    }

    return this;
  }
  // 删除订阅
  $off(evt?: symbol, callback?: EventCallback) {
    if (isUndef(evt)) {
      this.$clear();
    } else if (typeof evt === 'symbol') {
      if (typeof callback === 'function' && Array.isArray(this.events[evt])) {
        this.events[evt] = this.events[evt].filter((cb) => cb !== callback);
      } else {
        Reflect.deleteProperty(this.events, evt);
        this.taskCallBackCache[evt] = null;
      }
    }
    return this;
  }
  // 只进行一次的事件订阅
  $once(evt: symbol, callback: EventCallback) {
    const proxyCallback: EventCallback = (...payload: any) => {
      callback.apply(this, payload);
      // 回调函数执行完成之后就删除事件订阅
      this.$off(evt, proxyCallback);
    };

    this.$on(evt, proxyCallback);
  }
  // 判断某一个事件是否还存着
  $has(evt: symbol, callback?: EventCallback) {
    if (isEmpty(this.events)) {
      return false;
    }
    if (isUndef(callback)) {
      return !isEmpty(this.events[evt]);
    }
    let events = this.events[evt];
    return events.some((item) => item === callback);
  }
  // 清除所有事件
  $clear() {
    this.events = {};
    this.taskCallBackCache = {};
  }
}
export default new Bus();
