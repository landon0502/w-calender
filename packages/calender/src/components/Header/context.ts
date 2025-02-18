import { HeaderConfig } from './types';
export const headerDefaultConfig: Required<HeaderConfig> = {
  barHeight: 20,
  gap: 4,
  style() {
    return {
      background: 'red',
    };
  },
};
