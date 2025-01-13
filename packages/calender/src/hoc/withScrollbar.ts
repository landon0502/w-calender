import { FunctionComponent, createElement } from 'preact';

import Scrollbar, { ScrollbarProps } from '@/components/Scrollbar';
export default function withScrollbar(WrappedComponent: FunctionComponent, props?: ScrollbarProps) {
  return createElement(Scrollbar, {
    children: WrappedComponent,
    ...props,
  });
}
