import { RefObject } from 'preact';
import { isUndef, isRef } from './is';
import { isReturnTime } from './time';
import dayjs from 'dayjs';
/**
 * @zh 添加单位
 */
export function addUnit(n: number, unit: string) {
  return n + unit;
}

/**
 * @zh 转36进制
 */
export function numTo36(n = new Date().valueOf()) {
  return n.toString(36);
}
/**
 * @zh 创建一个唯一ID
 */
export function createUniqueId(n?: number) {
  if (isUndef(n)) n = new Date().valueOf();
  return numTo36(n) + Math.random().toString(36).substring(2);
}

/**
 * @zh 深克隆
 * @param { Object, Array<Object> } target 目标数据
 */
export function deepClone<T>(target: T): T {
  if (
    isUndef(target) ||
    typeof target !== 'object' ||
    isReturnTime(target) ||
    dayjs.isDayjs(target)
  ) {
    return target; // 基本类型直接返回
  }

  const targetObj: any = Array.isArray(target) ? [] : {};

  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      targetObj[key] = deepClone(target[key]);
    }
  }

  return targetObj;
}

/**
 * @zh 根据相同值将数组进行分组
 */
export function arrayGroupByValue<T, K extends keyof T>(data: Array<T>, groupKey: K) {
  if (!Array.isArray(data) || typeof groupKey !== 'string') return [];
  let map = new Map<T[K], Array<T>>();
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    let groupValue = item[groupKey];
    let gourp = map.get(groupValue);
    if (isUndef(gourp)) {
      gourp = [item];
      map.set(groupValue, gourp);
    } else {
      gourp.push(item);
    }
  }

  return Array.from(map).map(([groupValue, group]) => ({
    groupValue,
    group,
  }));
}

export function unref<T>(target: T | RefObject<T>): T | null {
  if (isRef(target)) {
    return target.current;
  } else {
    return target;
  }
}

/**
 * @zh 记录拖拽距离，大于threshold单位距离才触发事件
 * @returns
 */
export function moveThreshold() {
  let historydistance = 0;
  let setInitial = (v: number) => {
    historydistance = v;
    setInitial = () => {};
  };
  return (dy: number, threshold: number, initial: number = 0): number | false => {
    setInitial(initial);
    historydistance += dy;
    if (Math.abs(historydistance) > threshold) {
      let returnDy = historydistance;
      historydistance = Math.abs(historydistance) - threshold;
      if (returnDy < 0) historydistance = -historydistance;
      return returnDy > 0 ? threshold : -threshold;
    }
    return false;
  };
}

/**
 * @zh 添加延时
 */
export function execWithDelay(callback: Function, delay: number) {
  if (delay) {
    let timer = setTimeout(() => {
      callback();
      clearTimeout(timer);
    }, delay);
  } else {
    callback();
  }
}

/**
 * @zh 防抖
 */
export function debounce(fn: (...args: any[]) => any, delay: number) {
  let timer: number | null = null;
  return function (this: any) {
    if (!isUndef(timer)) clearTimeout(timer);
    timer = setTimeout(fn.bind(this, ...arguments), delay);
  };
}
/**
 * 节流
 * @param {function} fn
 * @param {number} wait
 * @returns {function}
 */
export function throttle(fn: (...args: any[]) => any, wait: number, immediately: boolean = false) {
  let pre = Date.now();
  return function (this: any) {
    let now = Date.now();
    if (immediately) {
      fn.apply(this, [...arguments]);
      immediately = false;
    }
    if (now - pre >= wait) {
      fn.apply(this, [...arguments]);
      pre = Date.now();
    }
  };
}
