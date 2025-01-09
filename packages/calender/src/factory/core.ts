import type { CalenderItem } from '@/types/options';
export default abstract class CalendarCore {
  abstract onBeforeUpdate(e: {
    target: CalenderItem;
    data: CalenderItem[];
  }): Promise<boolean> | boolean;

  abstract onMount(): void;
  abstract onUnmount(): void;
}
