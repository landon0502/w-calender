import { VNode, h, FunctionComponent, ComponentChildren } from 'preact';
import { createElement, isValidElement } from 'preact/compat';
import { isFunction, isString } from '@/utils';

export type Template<T = any> =
  | VNode
  | string
  | FunctionComponent<{ data?: T }>
  | ComponentChildren;

export interface RenderTemplateProps<T> {
  template?: Template<T>;
  tagName?: keyof HTMLElementTagNameMap;
  style?: h.JSX.CSSProperties;
  className?: string;
  data?: T;
}
/**
 * @zh 渲染模版、这里需要支持个各框架vue、react、字符串
 */
export default function RenderTemplate<T>(options: RenderTemplateProps<T>) {
  const { template, tagName = 'div', className, style, data } = options;

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
    let componentTemp = template({ data });
    return RenderTemplate({ ...options, template: componentTemp });
  }
  return null;
}
