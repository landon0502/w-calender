import { PropsWithChildren } from '@/types/common';
import { forwardRef } from 'preact/compat';
import type { Rect, OperateType } from '@/types/components';
import { genStyles } from '../_utils';
import { cls } from '@/utils';
/**
 * @zh 拖拽样式
 */
const OperateTime = forwardRef<HTMLDivElement, PropsWithChildren<{ layout: Rect }>>(
  ({ layout, children }, ref) => {
    return (
      <div className={cls(['operate-placelholder'])} style={genStyles(layout)} ref={ref}>
        {children}
      </div>
    );
  }
);

export default function Placelholder(props: PropsWithChildren<{ layout: Rect }>) {
  return <OperateTime layout={props.layout}>{props.children}</OperateTime>;
}
