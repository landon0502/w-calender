import { PropsWithChildren } from '@/types/common';
import { forwardRef } from 'preact/compat';
import type { Rect, OperateType } from '@/types/components';
import { genStyles } from '@/components/_utils';
import { cls } from '@/utils';
import type { DragConfig } from './';
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

export function DragoverBubble(props: PropsWithChildren<{ layout: Rect }>) {
  return <OperateTime layout={props.layout}>{props.children}</OperateTime>;
}

export default ({ drag }: { drag: DragConfig }) => {
  return drag && <DragoverBubble layout={drag.rect} />;
};
