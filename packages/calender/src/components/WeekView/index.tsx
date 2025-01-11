import './style/index.scss';
import { useMemo } from 'preact/compat';
import { getWeekDays, cls, getReturnTime, isAsyncFunction, isFunction } from '@/utils';
import { useXState } from '@/hooks';
import dayjs from 'dayjs';
import Column from '../Column';
import { useStore } from '@/contexts/calenderStore';
import type { PropsWithElAttrs } from '@/types/common';
import type { CalenderItem } from '@/types/options';
import type { WeekViewProps } from '@/types/components';

const WeekView = (props: PropsWithElAttrs<WeekViewProps>) => {
  const { store } = useStore();
  const [weekDays] = useXState(getWeekDays(dayjs(), 1));

  const data = useMemo(() => {
    return store?.data ?? [];
  }, [store]);

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
    <div className={cls(['week-view'])}>
      {weekDays.map((item, index) => {
        return (
          <Column
            multipleColumns
            data={data}
            cellHeight={42}
            timeInterval={30}
            date={[getReturnTime(item.time.startOf('D')), getReturnTime(item.time.endOf('D'))]}
            onChange={onDataChange}
            columnIndex={index}
            columnCount={weekDays.length}
          />
        );
      })}
    </div>
  );
};

export default WeekView;
