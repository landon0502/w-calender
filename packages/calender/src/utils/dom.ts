import { addUnit } from './common';
import { isUndef, isElement } from './is';
import { ElementRect } from './resizeObserver';
/**
 * 获取px
 */
export function numToPx(n: string | number = 0, defaultValue: string = '0px') {
  if (typeof n === 'number') {
    return addUnit(n, 'px');
  }
  if (typeof n === 'string' && n.endsWith('px')) {
    return n;
  }
  return defaultValue;
}

/**
 * 获取html元素
 */
export function getElement(el: string | HTMLElement): HTMLElement | Element | null {
  if (isElement(el)) return el;
  if (typeof el === 'string') return document.querySelector(el);
  return null;
}

/**
 * 获取元素尺寸
 */
export function getBoundingClientRect(el: string | HTMLElement): ElementRect | null {
  const target = getElement(el);
  if (target) {
    return target.getBoundingClientRect();
  }
  return null;
}

/**
 * @desc 设置元素属性setAttribute
 */
export function setAttributes(el: HTMLElement, attrs: { [prop: string]: string }) {
  for (let attr in attrs) {
    el.setAttribute(attr, attrs[attr]);
  }
}

/**
 * @desc 设置style属性
 */
export function setElementStyle(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  for (let styleName in styles) {
    if (styles[styleName]) {
      el.style[styleName] = styles[styleName];
    }
  }
}

export function getTransform(
  config: Partial<Record<'left' | 'top' | 'width' | 'height', string>>
): Partial<CSSStyleDeclaration> {
  const { width, height, top, left } = config;

  // Replace unitless items with px
  const translate = 'translate3d(' + left + ',' + top + ', 0)';
  const style: Partial<CSSStyleDeclaration> = {
    transform: translate,
    webkitTransform: translate,
  };
  if (!isUndef(width) && height !== '') {
    style.width = width;
  }
  if (!isUndef(height) && height !== '') {
    style.height = height;
  }

  return style;
}

/**
 * @zh 解析transform x y
 */
export function parseTranslateXY(transform: string) {
  if (!transform) {
    return {
      x: 0,
      y: 0,
    };
  }
  let valStr = '';
  if (transform.startsWith('translate3d')) {
    valStr = transform.slice(12, -1);
  } else if (transform.startsWith('translate')) {
    valStr = transform.slice(10, -1);
  }
  let res = valStr.split(',').map((v) => v.replace('px', ''));
  return {
    x: ~~res[0],
    y: ~~res[1],
  };
}

/**
 * @desc 获取transform translate3d的值
 */
export function getAttrsTransformTranslate(el: HTMLElement): { x: number; y: number } {
  let transform = el.style.transform ?? '';
  return parseTranslateXY(transform);
}
