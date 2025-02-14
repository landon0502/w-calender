import './style/gridding.scss';
import { cls } from '@/utils';

export default function Gridding(props: {
  cellHeight: number;
  columnWidth?: number;
  columnCount: number;
}) {
  return (
    <div className={cls('gridding-lines')} style={{ '--col-h': props.cellHeight + 'px' }}></div>
  );
}
