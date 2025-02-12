import { h } from 'preact';
import type { Rect } from '@/types/components';

export type LayoutMouseEvent = Rect & { columnIndex: number };
export interface EventColumnLayoutContainerProps {
  cellHeight: number;
  interval: number;
  column: number;
  disabled?: boolean;
  className?: string;
  style?: h.JSX.CSSProperties;
  onStart?: (e: LayoutMouseEvent) => void;
  onMove?: (e: LayoutMouseEvent) => void;
  onEnd?: (e: LayoutMouseEvent) => void;
}
