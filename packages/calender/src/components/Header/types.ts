import type { CalenderItem } from '@/types/options';
import type { ReturnTimeValue } from '@/types/time';
export interface HeaderProps {
  data: Array<CalenderItem>;
  columnWidth?: number;
  days?: ReturnTimeValue[];
}
