import { cls } from '@/utils/css';
import Scrollbar from '../Scrollbar';
import './style/header.scss';
import type { HeaderProps } from '@wcalender/types/components';

export function TodayScheduleRow() {
  return <div className={cls('today-schedule-item')}></div>;
}

export default function Header(props: HeaderProps) {
  return (
    <div className={cls('multiple-columns-header')}>
      <div className={cls('multiple-columns-header-date')}>
        <span className={cls('multiple-columns-header-date-text')}>GMT+8</span>
      </div>
      <Scrollbar className={cls('multiple-columns-header-rows')} hideBar>
        {props.data.map((item) => (
          <TodayScheduleRow />
        ))}
      </Scrollbar>
    </div>
  );
}
