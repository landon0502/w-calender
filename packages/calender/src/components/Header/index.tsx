import './style/index.scss';
import type { HeaderProps } from './types';
import type { CalenderItem } from '@/types/options';
import { cls } from '@/utils/css';
import Scrollbar from '../Scrollbar';
import { numToPx } from '@/utils';
import { LAYOUT_CONTENT_KEY, LAYOUT_HEADER_KEY } from '../LayoutContainer/linkageKeys';
import RenderTemplate from '@/templates/RenderTemplate';
import { useTemplateStore } from '@/contexts/templateStore';
import { handleGridCols } from '../Column/hooks/useColumnLayout';
import { useMemo } from 'preact/hooks';
import { calculateDistance } from '../_utils';

export default function Header(props: HeaderProps) {
  const { getState } = useTemplateStore();
  const dayCellStyle = props.columnWidth
    ? { minWidth: numToPx(props.columnWidth), flexShrink: 1 }
    : {};
  const data = useMemo(() => handleGridCols(props.data), [props.data]);
  const maxIndex = Math.max(...data.map((item) => item.totalColumn));
  /**
   * @zh 计算y ,h坐标位置信息
   */
  function calculateRect(
    item: CalenderItem & {
      colIndex: number;
    },
    totalColumn: number
  ) {
    const cellH = 20;
    const totalSecond = (props.days?.length ?? 0) * 24 * 60 * 60; // s
    const { start, end, colIndex } = item;
    const currentSecond = end.time.diff(start.time, 'second');
    let x = (start.time.diff(props.days?.[0].time, 'second') / totalSecond) * 100 + '%';

    let y = colIndex * cellH;
    let w = (currentSecond / totalSecond) * 100 + '%';
    let h = cellH;

    return { x, y, w, h };
  }

  function renderDays() {
    function renderItem() {
      return props.days?.map((item) => {
        return (
          <div
            className={cls(['header-rows-days-item', 'header-rows-boder-gridcell'])}
            style={dayCellStyle}
          >
            <RenderTemplate data={{ date: item }} template={getState('templates').dayCell} />
          </div>
        );
      });
    }

    return <div className={cls(['header-rows-days'])}>{renderItem()}</div>;
  }

  function renderData() {
    const style = {};
    return (
      <>
        <div className={cls(['header-rows-data'])} style={{ height: maxIndex * 20 + 'px' }}>
          <div className={cls('header-rows-presentation')}>
            {props.days?.map(() => {
              return (
                <div
                  className={cls([
                    'header-rows-presentation-gridcell',
                    'header-rows-boder-gridcell',
                  ])}
                  style={{ ...dayCellStyle, height: '100%' }}
                ></div>
              );
            })}
          </div>

          <div className={cls('header-rows-bars')}>
            {data.map((group) =>
              group.data.map(({ colIndex, ...config }) => {
                let rect = calculateRect({ ...config, colIndex }, group.totalColumn);
                return (
                  <div
                    className={cls('header-rows-bars-item')}
                    style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                  >
                    <RenderTemplate
                      data={{
                        config,
                      }}
                      template={() => <div></div>}
                    />
                  </div>
                );
              })
            )}
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
