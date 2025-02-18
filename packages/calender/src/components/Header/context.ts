import { HeaderConfig } from './types';
import createBounding from '../DragoverBubble/createBounding';
import { HEADER_BAR_BUBBLE } from '@/constant/busEventName';

const headerDefaultConfig: Required<HeaderConfig> = {
  barHeight: 20,
  gap: 4,
  style() {
    return {
      background: 'red',
    };
  },
};

const { updateDragoverBubbleState, useDragoverBubble, dragoverBubbleBusEvent } =
  createBounding(HEADER_BAR_BUBBLE);

export {
  updateDragoverBubbleState,
  useDragoverBubble,
  dragoverBubbleBusEvent,
  headerDefaultConfig,
};
