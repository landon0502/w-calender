import { FunctionComponent, createElement } from 'preact';

import Scrollbar, { ScrollbarProps } from '@/components/Scrollbar';
export default function withScrollbar(
  WrappedComponent: FunctionComponent,
  options?: { disabledScroll?: boolean }
) {
  return (props: ScrollbarProps) =>
    createElement(options?.disabledScroll ? 'div' : Scrollbar, {
      children: createElement(WrappedComponent, null),
      ...props,
    });
}
