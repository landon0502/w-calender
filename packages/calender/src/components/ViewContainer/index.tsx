import './style/index.scss';
import { ComponentChildren, h } from 'preact';
import { PropsWithChildren } from '@/types/common';
import { ScrollbarProps } from '../Scrollbar';
import { withScrollbar } from '@/hoc';
import { cls } from '@/utils';

export interface ViewContainerProps {
  header?: ComponentChildren;
  content?: ComponentChildren;
  timeIndicateLine?: ComponentChildren;
  timeIndicateBar?: ComponentChildren;
  style?: h.JSX.CSSProperties;
  headerStyle?: h.JSX.CSSProperties;
  scrollbar?: boolean;
  scrollbarStyle?: h.JSX.CSSProperties;
  scrollProps?: ScrollbarProps;
  className?: string;
}

export default function ViewContainer(props: PropsWithChildren<ViewContainerProps>) {
  return (
    <div className={cls('view-container')} style={props.style}>
      <div className={cls('view-container-header')} style={props.headerStyle}>
        {props.header}
      </div>
      {withScrollbar(
        () => (
          <div className={cls('view-container-grid')}>
            {props.timeIndicateBar}

            <div className={cls('view-container-grid-layout')}>
              {props.content}
              {props.timeIndicateLine}
            </div>
          </div>
        ),
        {
          className: cls('scroll-container'),
          disabledScroll: false,
          ...props.scrollProps,
        }
      )}
    </div>
  );
}
