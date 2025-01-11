import './style/index.scss';
import { useRef, useMemo } from 'preact/compat';
import Scrollbar from '../Scrollbar';
import Header from './Header';
import Column from '../Column';
import { TimeIndicateBar, TimeIndicateLine } from '../TimeIndicateBar';
import dayjs, { Dayjs } from 'dayjs';
import { useStore } from '@/contexts/calenderStore';
import { cls, isAsyncFunction, isFunction, isContainTimeRange } from '@/utils';
import type { DayViewProps } from '@/types/components';
import type { CalenderItem } from '@/types/options';
import type { ReturnTimeValue } from '@/types/time';

const cellHeight = 42;
const interval = 30;
const gap = 8;

/**
 * @zh 计算时间Y位置
 */
function calculateDistance(start: Dayjs, end: Dayjs, colHeight: number) {
  let timeValue = end.diff(start, 'second');
  return (timeValue / (interval * 60)) * colHeight;
}

function DayView(props: DayViewProps) {
  const layoutContainer = useRef<HTMLDivElement>(null);

  const { store } = useStore();

  // 这里的数据需统一使用store存储
  // const data = useRef(getState('data'));
  const data = useMemo(() => {
    return store?.data ?? [];
  }, [store]);
  // 头部列表渲染
  const todayData = useMemo(() => {
    return (
      data?.filter(
        (item: { end: ReturnTimeValue; start: ReturnTimeValue }) =>
          !isContainTimeRange([item.start, item.end], props.date, 'minute', '[)')
      ) ?? []
    );
  }, [data]);

  // 数据更改
  async function onDataChange(event: { target: CalenderItem; data: CalenderItem[] }) {
    let allow = true;
    if (isAsyncFunction(props.onBeforeUpdate) || isFunction(props.onBeforeUpdate)) {
      allow = await props.onBeforeUpdate(event);
    }
    if (allow) {
      props.onChange?.(event);
    }
  }

  return (
    <div className={cls('day')}>
      <Header data={todayData} />
      <Scrollbar hideBar className={cls('grid-scrollbar')}>
        <div className={cls('day-grid')} style={{ '--col-h': cellHeight + 'px' }}>
          <TimeIndicateBar
            range={props.date}
            interval={interval}
            cellHeight={cellHeight}
            cellWidth={72}
          />
          <div className={cls('day-grid-layout')} ref={layoutContainer}>
            <Column
              data={data}
              date={props.date}
              cellHeight={cellHeight}
              bordered={false}
              onChange={onDataChange}
            />
            <TimeIndicateLine
              top={calculateDistance(dayjs().startOf('day'), dayjs(), cellHeight)}
            />
          </div>
        </div>
      </Scrollbar>
    </div>
  );
}

export default DayView;
