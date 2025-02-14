import './style/gridding.scss';
import { cls, isUndef, numToPx } from '@/utils';

export default function Gridding(props: {
  cellHeight: number;
  columnCount: number;
  rowCount: number;
  columnWidth?: number;
}) {
  function renderCells() {
    let ls = new Array(props.rowCount).fill({});
    let cellStyle = {
      height: numToPx(props.cellHeight),
      '--column-count': props.columnCount,
    };
    return ls.map((item) => <div className={cls('gridding-lines-cell')} style={cellStyle}></div>);
  }
  return (
    <div className={cls('gridding-lines')} style={{ '--col-h': props.cellHeight + 'px' }}>
      {renderCells()}
    </div>
  );
}
