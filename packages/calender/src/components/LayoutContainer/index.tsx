import './style/index.scss';
import { ComponentChildren, h } from 'preact';
import { PropsWithChildren } from '@/types/common';
import Scrollbar, { ScrollbarProps } from '../Scrollbar';
import { cls } from '@/utils';
import { LAYOUT_CONTENT_KEY, LAYOUT_SIDER_KEY, LAYOUT_HEADER_KEY } from './linkageKeys';

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
    <div className={cls('layout')} style={props.style}>
      <div className={cls('layout-header')} style={props.headerStyle}>
        {props.header}
      </div>
      <div className={cls('layout-content')}>
        <Scrollbar
          className={cls(['layout-scroll', 'layout-content-bar'])}
          hideBar
          linkageId={LAYOUT_SIDER_KEY}
          linkage={[LAYOUT_CONTENT_KEY]}
        >
          {props.timeIndicateBar}
        </Scrollbar>
        <Scrollbar
          className={cls(['layout-scroll', 'layout-content-grid'])}
          {...props.scrollProps}
          linkageId={LAYOUT_CONTENT_KEY}
          linkage={[LAYOUT_HEADER_KEY, LAYOUT_SIDER_KEY]}
        >
          <div className={cls('layout-content-grid-columns')}>
            <div className={cls('layout-content-grid-columns-content')}>
              {props.content}
              {props.timeIndicateLine}
            </div>
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
