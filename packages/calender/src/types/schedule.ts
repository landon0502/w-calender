import { TimeValue } from './time';
export type DateRange = [TimeValue, TimeValue];

// 配置项
export interface ScheduleItem {
  start: string;
  end: string;
  title: string;
  [prop: string]: any;
}

export type ScheduleData = ScheduleItem[];
