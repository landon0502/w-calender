import { ComponentChildren, h } from 'preact';

import { ScrollbarProps } from '../Scrollbar/types';
export interface ViewContainerProps {
  header?: ComponentChildren;
  content?: ComponentChildren;
  timeIndicateLine?: ComponentChildren;
  timeIndicateBar?: ComponentChildren;
  style?: h.JSX.CSSProperties;
  headerStyle?: h.JSX.CSSProperties;
  scrollbar?: boolean;
  scrollbarStyle?: h.JSX.CSSProperties;
  scrollProps?: ScrollbarProps;
  className?: string;
}
