import './style/index.scss';
import type { ReturnTimeValue } from '@/types/time';
import { t } from '@/lanuage';
import { cls } from '@/utils';

export default {
  dayCell(props: { data: { date: ReturnTimeValue } }) {
    const { data } = props;
    const dayMap = ['W7', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
    return (
      <div className={cls('header-day-cell')}>
        <span>{t(dayMap[data.date.time.day()])}</span>
        <span>{data.date.time.date()}</span>
      </div>
    );
  },
};
