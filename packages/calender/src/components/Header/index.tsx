import './style/index.scss';
import type { HeaderProps } from './types';
import { cls } from '@/utils/css';
import Scrollbar from '../Scrollbar';
import { numToPx } from '@/utils';

import { LAYOUT_CONTENT_KEY, LAYOUT_HEADER_KEY } from '../LayoutContainer/linkageKeys';
import RenderTemplate from '@/templates/RenderTemplate';
import { useI18n } from '@/lanuage';
import { useTemplateStore } from '@/contexts/templateStore';

export function TodayScheduleRow() {
  {
    /* 这里需要模版配置 */
  }
  const { t } = useI18n();

  return (
    <div className={cls('today-schedule-item')}>
      <RenderTemplate template={() => <div>{t('W1')}</div>} />
    </div>
  );
}

export default function Header(props: HeaderProps) {
  const { t } = useI18n();
  const { getState } = useTemplateStore();

  function renderDays() {
    const dayCellStyle = props.columnWidth
      ? { minWidth: numToPx(props.columnWidth), flexShrink: 1 }
      : {};

    function renderItem() {
      return props.days?.map((item) => {
        return (
          <div className={cls(['header-rows-days-item'])} style={dayCellStyle}>
            {/* 这里需要模版配置 */}
            <RenderTemplate data={{ date: item }} template={getState('templates').dayCell} />
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
