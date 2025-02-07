import { VNode } from 'preact';
import { ScheduleData, ScheduleItem } from './schedule';

import { ReturnTimeValue } from '@/types/time';
import { OnBeforeUpdate } from './events';
import type { TimeValue } from '@/types/time';
export type ViewType = 'day' | 'week' | 'month' | 'D' | 'W' | 'M';

export type Template = string | VNode;

export interface CalenderEvents {
  onChange?(event: { target: CalenderItem; data: CalenderItem[] }): void;
  onUpdate?(): void;
  onMount?(): void;
  onUnmount?(): void;
}

export interface LayoutConfig {
  interval: number;
  gap: number;
  cellHeight: number;
  column?: number;
  columns?: Array<{ width: number; columnIndex: number }>;
}

export interface WeekLayoutConfig {}
export interface MonthLayoutConfig {}

/**
 * @zh WCalender类options配置项
 */
export interface Options extends CalenderEvents {
  data: ScheduleData;
  date: TimeValue;
  viewType: ViewType;
  templates?: Partial<Record<ViewType, Partial<Record<'drag' | 'add', Template>>>>; // 自定义模版
  onBeforeUpdate?: OnBeforeUpdate;
  layoutConfig: LayoutConfig;
}

export interface CalenderItem {
  title: string;
  start: ReturnTimeValue;
  end: ReturnTimeValue;
  _key: string;
  _raw?: ScheduleItem;
}
