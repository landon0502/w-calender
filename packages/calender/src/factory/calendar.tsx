import type { DayViewProps } from '@/types/components';
import type { Options, CalenderItem } from '@/types/options';
import type { ViewType, LayoutConfig } from '@/types/options';
import type { ScheduleData, ScheduleItem } from '@/types/schedule';
import { render, FunctionComponent } from 'preact/compat';
import { DayView, WeekView, MonthView } from '@/views/index';
import { isAsyncFunction, isFunction, createUniqueId, getReturnTime, deepMerge } from '@/utils';
import CalendarCore from './core';
import { setStore, StoreProvider, store, commitKeys } from '@/contexts/calenderStore';
import { TemplateProvider, templateStore, templateCommitKeys } from '@/contexts/templateStore';
import locale_zh from '@/lanuage/locale/zh.json';
import { setLanuageDict, setLanuageLocale, LanuageProvider } from '@/lanuage';
import defaultTemplates from '@/templates/default';
import dayjs from 'dayjs';

const defaultLayoutConfig = {
  cellHeight: 42,
  interval: 30,
  gap: 8,
};
const defaultLanuage = { zh: locale_zh };
const defaultOptions: Required<Options> = {
  date: dayjs(),
  data: [],
  viewType: 'D',
  templates: {},
  layoutConfig: defaultLayoutConfig,
  lanuageDict: defaultLanuage,
  locale: 'zh',
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
    <TemplateProvider>
      <LanuageProvider>
        <StoreProvider>
          <Component
            date={props.date}
            onChange={props.onChange}
            onBeforeUpdate={props.onBeforeUpdate}
          />
        </StoreProvider>
      </LanuageProvider>
    </TemplateProvider>
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
  layoutConfig: LayoutConfig = defaultLayoutConfig;

  constructor(el: HTMLElement, options: Partial<Options>) {
    super();
    this.el = el;
    this.setOptions(options);
  }

  // 处理数据格式
  private formatData(data: ScheduleData) {
    this.data = getData(data);
  }

  // 设置配置
  setOptions(options: Partial<Options>) {
    this.options = { ...defaultOptions, ...options };
    if (options.viewType) {
      this.viewType = options.viewType;
    }

    this.layoutConfig = deepMerge(defaultLayoutConfig, options.layoutConfig, true);
    this.changeView(this.viewType);
    this.formatData(this.options.data);
    setStore({
      data: this.data,
      layoutConfig: this.layoutConfig,
      viewType: this.viewType,
      freezeContainerEvent: false,
    });
    if (options.locale) {
      setLanuageLocale(options.locale ?? defaultOptions.locale);
    }
    if (this.options.lanuageDict) {
      setLanuageDict(deepMerge(defaultLanuage, options.lanuageDict));
    }
    templateStore.commit(templateCommitKeys.SET_TEMPLATES, {
      ...defaultTemplates,
      ...(options.templates ?? {}),
    });
  }

  // 更改视图
  changeView(type: ViewType) {
    this.viewType = type;
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
    return () => {
      render(null, this.el);
    };
  }
}

export { DayView, WeekView, MonthView };
export default Calender;

/**
 * @zh types export
 */
export type { Options, ScheduleData, ScheduleItem };
