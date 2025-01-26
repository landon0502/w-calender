import { RefObject } from 'preact';
export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';
/**
 * 判断是否为HTML元素
 */
export function isElement(el: any): el is HTMLElement {
  return typeof HTMLElement === 'object'
    ? el instanceof HTMLElement //DOM2
    : el &&
        typeof el === 'object' &&
        el !== null &&
        el.nodeType === 1 &&
        typeof el.nodeName === 'string';
}

export function isUndef(v: any): v is undefined | null {
  return v === undefined || v === null;
}

/**
 * @zh 是否为数组
 */
export const isArray = Array.isArray;

/**
 * @zh Object.prototype.toString.call判断数据类型
 */
export function judgType(val: any) {
  let t = Object.prototype.toString.call(val);
  let reg = /^\[(object){1}\s{1}(\w+)\]$/i;
  return t.replace(reg, '$2').toLowerCase();
}

/**
 * @zh 判断对象是否是一个纯粹的对象
 */
export function isObject(obj: any): obj is object {
  return judgType(obj) === 'object';
}

/**
 * @zh 判断Array/Object为空
 */
export function isEmpty(target: any) {
  return (
    isUndef(target) ||
    (Array.isArray(target) && target.length === 0) ||
    (isObject(target) && Reflect.ownKeys(target).length === 0)
  );
}

/**
 * @zh 判断是否为useRef
 */
export function isRef<T>(val: any): val is RefObject<T> {
  if (typeof val !== 'object' || isUndef(val)) {
    return false;
  }
  return 'current' in val;
}

/**
 * @zh 判断是否为函数
 */
export function isFunction(val: any): val is Function {
  return val instanceof Function;
}

/**
 * @zh 判断是否为async函数
 */
export function isAsyncFunction(val: any): val is Function {
  return judgType(val) === 'asyncfunction';
}

/**
 * @zh 判断是否为Date
 */
export function isDate(val: any): val is Date {
  return val instanceof Date;
}

/**
 * @zh 判断为number
 */
export function isNumber(val: any): val is number {
  return typeof val === 'number';
}
