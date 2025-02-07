import { ComponentChildren, h } from 'preact';
import type { ScheduleData } from './schedule';
import type { Dayjs } from 'dayjs';
export type Date<T = string | Dayjs> = [T, T] | T;

export interface ChCalenderOptions {
  data: ScheduleData;
}

export type PropsWithElAttrs<Props = {}> = Props & {
  style?: h.JSX.CSSProperties;
  className?: string;
};

export type PropsWithChildren<Props = {}> = Props & { children?: ComponentChildren };

export type GetDefaultOptions = <T extends object>(defaultOptions: Required<T>) => Required<T>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type MaybeElement = HTMLElement | SVGElement | undefined | null;
