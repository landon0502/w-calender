import './style/index.scss';
import { cls } from '@/utils/css';
import { numToPx } from '@/utils/dom';
export default function (props: { top: number; left: string }) {
  return (
    <div
      className={cls('time-indicate-line')}
      style={{ top: numToPx(props.top), '--dot-left': props.left }}
    ></div>
  );
}
