import './style/index.scss';
import type { HeaderProps } from './types';
import { cls } from '@/utils/css';
import Scrollbar from '../Scrollbar';
import { numToPx } from '@/utils';
import { LAYOUT_CONTENT_KEY, LAYOUT_HEADER_KEY } from '../LayoutContainer/linkageKeys';
import RenderTemplate from '@/templates/RenderTemplate';
import { useTemplateStore } from '@/contexts/templateStore';

// 移动事件与下方grid事件及数据格式相同

export default function Header(props: HeaderProps) {
  const { getState } = useTemplateStore();
  const dayCellStyle = props.columnWidth
    ? { minWidth: numToPx(props.columnWidth), flexShrink: 1 }
    : {};

  function renderDays() {
    function renderItem() {
      return props.days?.map((item) => {
        return (
          <div className={cls(['header-rows-days-item'])} style={dayCellStyle}>
            <RenderTemplate data={{ date: item }} template={getState('templates').dayCell} />
          </div>
        );
      });
    }

    return <div className={cls(['header-rows-days'])}>{renderItem()}</div>;
  }

  function renderData() {
    return (
      <>
        <div className={cls(['header-rows-data'])} style={{ height: '40px' }}>
          <div className={cls('header-rows-presentation')}>
            {props.days?.map(() => {
              return (
                <div
                  className={cls(['header-rows-presentation-gridcell'])}
                  style={{ ...dayCellStyle, height: '40px' }}
                ></div>
              );
            })}
          </div>
          <div className={cls('header-rows-bars')}>
            {props.data.map((item) => (
              <div className={cls('header-rows-bars-item')}>
                <RenderTemplate template={() => <div></div>} />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={cls('header')}>
      <div className={cls('header-date')}></div>
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
