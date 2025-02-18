import type { CalenderItem } from '@/types/options';
import type { ReturnTimeValue } from '@/types/time';
import type { WithFunctionReturn } from '@/types/common';
import { h } from 'preact';

export interface HeaderConfig {
  barHeight?: number;
  gap?: number;
  style?: WithFunctionReturn<h.JSX.CSSProperties>;
}
export interface HeaderProps {
  data: Array<CalenderItem>;
  columnWidth?: number;
  days: ReturnTimeValue[];
  headerConfig?: HeaderConfig;
}
