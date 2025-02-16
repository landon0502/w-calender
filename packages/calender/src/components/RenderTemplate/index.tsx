import { VNode, h } from 'preact';
import { createElement, isValidElement } from 'preact/compat';
import { isFunction, isString } from '@/utils';
/**
 * @zh 渲染模版、这里需要支持个各框架vue、react、字符串
 */
export default function RenderTemplate(options: {
  template?: VNode | string | Function;
  tagName?: keyof HTMLElementTagNameMap;
  style?: h.JSX.CSSProperties;
  className?: string;
  data?: any;
}) {
  const { template, tagName = 'div', className, style } = options;
  if (isValidElement(template)) {
    return template;
  }
  if (isString(template)) {
    return createElement(tagName, {
      className,
      style,
      dangerouslySetInnerHTML: {
        __html: template,
      },
    });
  }
  if (isFunction(template)) {
    return template();
  }
  return null;
}
