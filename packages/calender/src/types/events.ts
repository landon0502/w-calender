import { CalenderItem } from './options';

export type OnBeforeUpdate = (value?: {
  target: CalenderItem;
  data: CalenderItem[];
}) => boolean | Promise<boolean>;
export interface EventsProps {
  onBeforeUpdate?: OnBeforeUpdate;
  onChange?: (e: { target: CalenderItem; data: CalenderItem[] }) => void;
}
