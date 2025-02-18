import type { CalenderItem } from '@/types/options';
import type { EventsProps } from './events';
import type { TimeValue } from './time';
import { ComponentChildren, h } from 'preact';

export interface DayViewProps extends EventsProps {
  data: CalenderItem[];
  date: TimeValue;
}

export interface WeekViewProps extends EventsProps {
  data: CalenderItem[];
  date: TimeValue;
}

export interface ScheduleCardProps {
  title: string;
  startTime?: string;
  endTime?: string;
  className?: string;
}

export type Rect = {
  x: number | string;
  y: number;
  h: number;
  w: number | string;
};

export interface GridBoxProps extends Rect {
  className?: string;
  children?: ComponentChildren;
  data: CalenderItem;
  style?: h.JSX.CSSProperties;
  disabled?: boolean;
  onMoveStart?(event: any, data: CalenderItem, rect: Rect): void;
  onMove?(event: any, data: CalenderItem, rect: Rect): void;
  onMoveEnd?(event: any, data: CalenderItem, rect: Rect): void;
  onResizeStart?(event: any, data: CalenderItem, rect: Rect): void;
  onResize?(event: any, data: CalenderItem, rect: Rect): void;
  onResizeEnd?(event: any, data: CalenderItem, rect: Rect): void;
  onTap?(event: any, data: CalenderItem, rect: Rect): void;
  onBeforeUpdate?(): Promise<boolean> | boolean;
  moveThreshold?: {
    x?(event: any): number | false;
    y?(event: any): number | false;
  };
  edges?: Record<'top' | 'left' | 'right' | 'bottom', boolean>;
}

export type OperateType = 'resize' | 'move' | 'add';
