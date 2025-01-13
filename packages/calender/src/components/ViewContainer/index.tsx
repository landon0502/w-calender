import { ComponentChildren, h } from 'preact';
import { PropsWithChildren } from '@/types/common';
import { ScrollbarProps } from '../Scrollbar';
import { withScrollbar } from '@/hoc';
import { cls } from '@/utils';
import { TimeIndicateBar, TimeIndicateLine } from '../TimeIndicateBar';
import { DateRange } from '@/types/schedule';

export interface ViewContainerProps {
  header?: ComponentChildren;
  content?: ComponentChildren;
  style?: h.JSX.CSSProperties;
  headerStyle?: h.JSX.CSSProperties;
  scrollbar?: boolean;
  scrollbarStyle?: h.JSX.CSSProperties;
}
export interface ColumnContaienrProps extends ScrollbarProps {
  scrollbar: boolean;
  children?: ComponentChildren;
}

export default function ViewContainer(props: PropsWithChildren<ViewContainerProps>) {
  return (
    <div className={cls('view-container')} style={props.style}>
      {/* 头部 */}
      <div className={cls('view-container-header')} style={props.headerStyle}>
        {props.header}
      </div>
      {withScrollbar(
        () => (
          <div className={cls('view-container-grid')}>
            {/* 时间指示列 */}
            <TimeIndicateBar
              range={['', ''] as DateRange}
              interval={30}
              cellHeight={42}
              cellWidth={72}
            />
            <div className={cls('view-container-grid-layout')}>
              {/* 内容 */}
              {props.content}
              <TimeIndicateLine top={10} />
            </div>
          </div>
        ),
        {
          className: cls('view-container-scrollbar'),
          style: props.scrollbarStyle,
        }
      )}
    </div>
  );
}
