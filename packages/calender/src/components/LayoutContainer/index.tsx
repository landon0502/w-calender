import './style/index.scss';
import { PropsWithChildren } from '@/types/common';
import Scrollbar from '../Scrollbar';
import { cls } from '@/utils';
import { LAYOUT_CONTENT_KEY, LAYOUT_SIDER_KEY, LAYOUT_HEADER_KEY } from './linkageKeys';
import type { ViewContainerProps } from './types';

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
          verticalLinkage={[LAYOUT_CONTENT_KEY]}
        >
          {props.timeIndicateBar}
        </Scrollbar>
        <Scrollbar
          className={cls(['layout-scroll', 'layout-content-grid'])}
          {...props.scrollProps}
          linkageId={LAYOUT_CONTENT_KEY}
          horizontalLinkage={[LAYOUT_HEADER_KEY]}
          verticalLinkage={[LAYOUT_SIDER_KEY]}
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
