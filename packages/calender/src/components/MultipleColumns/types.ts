import type { CalenderItem } from '@/types/options';
import type { EventsProps } from '@/types/events';
import type { ReturnTimeValue } from '@/types/time';

export interface MultipleColumnsProps extends EventsProps {
  data: CalenderItem[];
  days: ReturnTimeValue[];
  columnWidth?: number;
}

export interface ViewContentProps {
  timeRangeDays: ReturnTimeValue[];
  data: CalenderItem[];
  cellHeight?: number;
  interval?: number;
  gap?: number;
  columnWidth?: number;
  onChange: (event: { target: CalenderItem; data: CalenderItem[] }) => {};
}
