import { render, FunctionComponent } from 'preact/compat';
import { DayView, WeekView, MonthView } from '@/views/index';

import {
  isArray,
  isAsyncFunction,
  isFunction,
  createUniqueId,
  getReturnTime,
  getTimeStartAndEnd,
} from '@/utils';
import type { UnitType } from 'dayjs';
import type { DayViewProps } from '@/types/components';
import type { Options, CalenderItem } from '@/types/options';
import type { Date } from '@/types/common';
import type { ViewType, LayoutConfig } from '@/types/options';
import type { ScheduleData, ScheduleItem, DateRange } from '@/types/schedule';
import CalendarCore from './core';
import { commitKeys } from '@/contexts/calenderStore';
import { setStore, StoreProvider, store } from '@/contexts/calenderStore';
import dayjs from 'dayjs';

const defaultOptions: Required<Options> = {
  date: dayjs(),
  data: [],
  viewType: 'D',
  templates: {},
  layoutConfig: {
    cellHeight: 42,
    interval: 30,
    gap: 8,
  },
  onChange() {},
  onUpdate() {},
  onMount() {},
  onUnmount() {},
  onBeforeUpdate() {
    return false;
  },
};
const views: Record<ViewType, FunctionComponent<any>> = {
  day: DayView,
  D: DayView,
  week: WeekView,
  W: WeekView,
  month: MonthView,
  M: MonthView,
};

interface DayProps extends DayViewProps {
  viewType: 'D' | 'day';
}

interface WeekProps extends DayViewProps {
  viewType: 'W' | 'week';
}

interface MonthProps extends DayViewProps {
  viewType: 'M' | 'month';
}

function RenderContent(props: DayProps | WeekProps | MonthProps) {
  const Component = views[props.viewType];
  return (
    <StoreProvider>
      <Component
        date={props.date}
        onChange={props.onChange}
        onBeforeUpdate={props.onBeforeUpdate}
      />
    </StoreProvider>
  );
}

/**
 * @zh 处理data数据，数据存在交叉时进行等比排布
 */
function getData(data: ScheduleData): Array<CalenderItem> {
  return data.map((item) => {
    let start = getReturnTime(item.start),
      end = getReturnTime(item.end);

    let config = {
      title: item.title,
      start: start,
      end: end,
      _key: createUniqueId(),
      _raw: item,
    };

    return config;
  });
}

class Calender extends CalendarCore {
  el: HTMLElement;
  options: Options = defaultOptions;
  data: CalenderItem[] = [];
  viewType: ViewType = 'D';
  cellHeight: number = 42;
  interval: number = 30;
  gap: number = 8;
  layoutConfig: LayoutConfig = defaultOptions.layoutConfig;

  constructor(el: HTMLElement, options: Partial<Options>) {
    super();
    this.el = el;
    this.setOptions(options);
  }

  // 处理数据格式
  private formatData(data: ScheduleData) {
    this.data = getData(data);
  }

  // 初始化store
  initStore() {
    setStore({
      data: this.data,
      layoutConfig: this.layoutConfig,
      viewType: this.viewType,
      freezeContainerEvent: false,
    });
  }

  // 设置配置
  setOptions(options: Partial<Options>) {
    this.options = { ...defaultOptions, ...options };
    if (options.viewType) {
      this.viewType = options.viewType;
    }
    this.layoutConfig = options.layoutConfig ?? defaultOptions.layoutConfig;
    this.changeView(this.viewType);
    this.formatData(this.options.data);
    this.initStore();
  }

  // 更改视图
  changeView(type: ViewType) {
    this.viewType = type;
    this.setLayoutConfig();
    this.render(type);
  }

  // 初始化columns配置
  setLayoutConfig() {
    this.layoutConfig = {
      ...this.layoutConfig,
    };
  }

  // 数据更新前触发
  onBeforeUpdate = async (event?: { target: CalenderItem; data: CalenderItem[] }) => {
    if (isFunction(this.options?.onBeforeUpdate) || isAsyncFunction(this.options?.onBeforeUpdate)) {
      return await this.options?.onBeforeUpdate(event);
    }
    return false;
  };

  /**
   * 组件类钩子函数
   */
  onMount() {
    // 组件加载
    this.options.onMount?.();
  }
  onUnmount() {
    // 组件卸载
    this.options.onUnmount?.();
  }
  onChange = (event: { target: CalenderItem; data: CalenderItem[] }) => {
    // 数据更新
    this.options.onChange?.(event);
    store.commit(commitKeys.SET_DATA, event.data);
  };

  // 渲染组件
  render(type: ViewType) {
    render(
      <RenderContent
        viewType={type}
        data={this.data}
        // days={getDaysByTimes(...getDate(this.options.date as Date, 'D'))}
        date={this.options.date}
        onChange={(e) => {
          this.onChange(e);
        }}
        onBeforeUpdate={this.onBeforeUpdate}
      />,
      this.el
    );
  }
}

export { DayView, WeekView, MonthView };
export default Calender;

/**
 * @zh types export
 */
export type { Options, ScheduleData, ScheduleItem };
