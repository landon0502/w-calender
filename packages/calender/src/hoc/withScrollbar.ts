import { FunctionComponent, createElement } from 'preact';

import Scrollbar, { ScrollbarProps } from '@/components/Scrollbar';
export default function withScrollbar(
  WrappedComponent: FunctionComponent,
  props?: { disabledScroll?: boolean } & ScrollbarProps
) {
  return createElement(props?.disabledScroll ? 'div' : Scrollbar, {
    children: createElement(WrappedComponent, null),
    ...props,
  });
}
