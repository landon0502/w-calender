import { VNode } from 'preact';
import { ScheduleData, ScheduleItem } from './schedule';
import { Date } from './common';
import { ReturnTimeValue } from '@/types/time';
import { OnBeforeUpdate } from './events';
export type ViewType = 'day' | 'week' | 'month' | 'D' | 'W' | 'M';

export type Template = string | VNode;

export interface CalenderEvents {
  onChange?(event: { target: CalenderItem; data: CalenderItem[] }): void;
  onUpdate?(): void;
  onMount?(): void;
  onUnmount?(): void;
}
/**
 * @zh WCalender类options配置项
 */
export interface Options extends CalenderEvents {
  data: ScheduleData;
  date?: Date;
  viewType: ViewType;
  templates?: Partial<Record<ViewType, Partial<Record<'drag' | 'add', Template>>>>; // 自定义模版
  onBeforeUpdate?: OnBeforeUpdate;
}

export interface CalenderItem {
  title: string;
  start: ReturnTimeValue;
  end: ReturnTimeValue;
  _key: string;
  _raw?: ScheduleItem;
}
