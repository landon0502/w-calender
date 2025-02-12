import { ComponentChildren, h } from 'preact';
import { LinkageId } from './useScrollLinkage';
export interface ScrollbarProps {
  children?: ComponentChildren;
  className?: string;
  style?: h.JSX.CSSProperties;
  hideBar?: Boolean;
  linkageId?: LinkageId;
  horizontalLinkage?: Array<LinkageId>;
  verticalLinkage?: Array<LinkageId>;
  onScroll?: (e: {
    event?: Event;
    scroll: { scrollHeight: number; scrollLeft: number; scrollTop: number; scrollWidth: number };
  }) => void;
}
