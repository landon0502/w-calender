import './style/index.scss';
import { cls } from '@/utils/css';
import Scrollbar from '../Scrollbar';
import { numToPx } from '@/utils';
import type { HeaderProps } from './types';
import { LAYOUT_CONTENT_KEY, LAYOUT_HEADER_KEY } from '../LayoutContainer/linkageKeys';

export function TodayScheduleRow() {
  {
    /* 这里需要模版配置 */
  }
  return <div className={cls('today-schedule-item')}></div>;
}

export default function Header(props: HeaderProps) {
  function renderDays() {
    const dayCellStyle = props.columnWidth
      ? { minWidth: numToPx(props.columnWidth), flexShrink: 1 }
      : {};

    function renderItem() {
      return props.days?.map((item) => {
        return (
          <div className={cls(['header-rows-days-item'])} style={dayCellStyle}>
            {/* 这里需要模版配置 */}
            {item.day}
            {item.date}
          </div>
        );
      });
    }

    return <div className={cls(['header-rows-days'])}>{renderItem()}</div>;
  }

  function renderData() {
    return (
      <div>
        {props.data.map((item) => (
          <TodayScheduleRow />
        ))}
      </div>
    );
  }

  return (
    <div className={cls('header')}>
      <div className={cls('header-date')}>
        <span className={cls('header-date-text')}>GMT+8</span>
      </div>
      <Scrollbar
        className={cls('header-rows')}
        hideBar
        linkageId={LAYOUT_HEADER_KEY}
        horizontalLinkage={[LAYOUT_CONTENT_KEY]}
      >
        {renderDays()}
        {renderData()}
      </Scrollbar>
    </div>
  );
}
