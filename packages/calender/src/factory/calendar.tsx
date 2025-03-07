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
 * @zh 处理数据，数据存在交叉时进行等比排布
 * @en Process data, and arrange it proportionally when there is an intersection of data
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

  // format data
  private formatData(data: ScheduleData) {
    this.data = getData(data);
  }

  // set config
  setOptions(options: Partial<Options>) {
    this.options = { ...defaultOptions, ...options };
    if (options.viewType) {
      this.viewType = options.viewType;
    }

    this.layoutConfig = deepMerge(defaultLayoutConfig, options.layoutConfig);
    this.changeView(this.viewType);
    this.formatData(this.options.data);
    setStore({
      data: this.data,
      layoutConfig: this.layoutConfig,
      viewType: this.viewType,
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

  // change view
  changeView(type: ViewType) {
    this.viewType = type;
    this.render(type);
  }

  // Triggered before data update
  onBeforeUpdate = async (event?: { target: CalenderItem; data: CalenderItem[] }) => {
    if (isFunction(this.options?.onBeforeUpdate) || isAsyncFunction(this.options?.onBeforeUpdate)) {
      return await this.options?.onBeforeUpdate(event);
    }
    return false;
  };

  /**
   * lifecycle hook
   */
  onMount() {
    // Component mount
    this.options.onMount?.();
  }
  onUnmount() {
    // Component unmount
    this.options.onUnmount?.();
  }
  onChange = (event: { target: CalenderItem; data: CalenderItem[] }) => {
    // 数据更新
    this.options.onChange?.(event);
    store.commit(commitKeys.SET_DATA, event.data);
  };

  // Component render
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
