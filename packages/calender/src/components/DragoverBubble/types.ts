// 事件key
import type { CalenderItem } from '@/types/options';
import type { Rect, OperateType } from '@/types/components';
export type DragConfig = { rect: Rect; data: CalenderItem; type: OperateType } | null;
