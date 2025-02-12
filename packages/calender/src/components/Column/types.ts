import type { CalenderItem } from '@/types/options';
import type { DateRange } from '@/types/schedule';
import type { Rect } from '@/types/components';

export interface ColumnEvent {
  onMoveStart?(event: any, data: CalenderItem, rect: Rect): void;
  onMove?(event: any, data: CalenderItem, rect: Rect): void;
  onMoveEnd?(event: any, data: CalenderItem, rect: Rect): void;
  onResizeStart?(event: any, data: CalenderItem, rect: Rect): void;
  onResize?(event: any, data: CalenderItem, rect: Rect): void;
  onResizeEnd?(event: any, data: CalenderItem, rect: Rect): void;
  onTap?(event: any, data: CalenderItem, rect: Rect): void;
  onChange?(event: { target: CalenderItem; data: CalenderItem[] }): void;
}

export interface ColumnProps extends ColumnEvent {
  data: CalenderItem[];
  date: DateRange;
  multipleColumns?: Boolean;
  columnIndex?: number;
  columnCount?: number;
  scrollTop?: number;
  cellHeight?: number;
  timeInterval?: number;
  gap?: number;
  bordered?: boolean;
  split?: boolean;
}
