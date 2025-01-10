import { render, FunctionComponent } from 'preact/compat';
import { DayView, WeekView, MonthView } from '@/components';
import { getReturnTime, getTimeStartAndEnd } from '@/utils/time';
import { createUniqueId } from '@/utils/common';
import { isArray, isAsyncFunction, isFunction } from '@/utils/is';
import type { UnitType } from 'dayjs';
import type { DayViewProps } from '@/types/components';
import type { Options, CalenderItem } from '@/types/options';
import type { Date } from '@/types/common';
import type { ViewType } from '@/types/options';
import type { ScheduleData, ScheduleItem, DateRange } from '@/types/schedule';
import CalendarCore from './core';

import { setStore, StoreProvider } from '@/contexts/calenderStore';

const defaultOptions: Required<Options> = {
  date: '',
  data: [],
  viewType: 'D',
  templates: {},
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
 * @zh 处理时间
 */
function getDate(date: Date, unit: UnitType): DateRange {
  if (isArray(date)) {
    let [start, end] = date;
    let startTime = getReturnTime(start);
    let endTime = getReturnTime(end);
    return [startTime, endTime];
  }
  return getTimeStartAndEnd(date, unit);
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
  constructor(el: HTMLElement, options: Partial<Options>) {
    super();
    this.el = el;
    this.setOptions(options);
    this.changeView(this.viewType);
  }

  // 处理数据格式
  private formatData(data: ScheduleData) {
    this.data = getData(data);
    this.initStore();
  }

  // 初始化store
  initStore() {
    setStore({ data: this.data });
  }

  // 设置配置
  setOptions(options: Partial<Options>) {
    this.options = { ...defaultOptions, ...options };
    if (options.viewType) {
      this.viewType = options.viewType;
    }

    this.formatData(this.options.data);
  }

  // 更改视图
  changeView(type: ViewType) {
    this.render(type);
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
    setStore({ data: event.data });
  };

  // 渲染组件
  render(type: ViewType) {
    render(
      <RenderContent
        viewType={type}
        data={this.data}
        date={getDate(this.options.date as Date, 'D')}
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
