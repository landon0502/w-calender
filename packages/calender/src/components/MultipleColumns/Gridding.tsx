import './style/gridding.scss';
import { cls, isUndef, numToPx } from '@/utils';

export default function Gridding(props: {
  cellHeight: number;
  columnCount: number;
  rowCount: number;
  columnWidth?: number;
}) {
  function renderHorizontalLines() {
    let ls = new Array(props.rowCount - 1).fill({});
    return ls.map((_, index) => (
      <div
        className={cls(['gridding-line', 'gridding-line-horizontal'])}
        style={{ left: 0, right: 0, top: numToPx(props.cellHeight * (index + 1)) }}
      ></div>
    ));
  }
  function renderVerticalLines() {
    let ls = new Array(props.columnCount - 1).fill({});
    return ls.map((_, index) => (
      <div
        className={cls(['gridding-line', 'gridding-line-vertical'])}
        style={{ top: 0, bottom: 0, left: `calc(100% / ${props.columnCount} * ${index + 1})` }}
      ></div>
    ));
  }
  return (
    <div className={cls('gridding-lines')} style={{ '--col-h': props.cellHeight + 'px' }}>
      {renderHorizontalLines()}
      {renderVerticalLines()}
    </div>
  );
}
