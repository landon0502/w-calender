import { VNode } from 'preact';
import { ScheduleData, ScheduleItem } from './schedule';

import { ReturnTimeValue } from '@/types/time';
import { OnBeforeUpdate } from './events';
import type { TimeValue } from '@/types/time';
import type { LanuageDict } from '@/contexts/lanuageStore';
import { Template } from '@/templates/RenderTemplate';

export type ViewType = 'day' | 'week' | 'month' | 'D' | 'W' | 'M';

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
  columnWidth?: number;
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
  templates?: Partial<Record<'day' | 'week' | 'month', Partial<Record<string, Template>>>>; // 自定义模版
  locale?: string;
  lanuageDict?: LanuageDict;
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
