import { createStore } from '@/store';
import type { CalenderItem, ViewType, LayoutConfig } from '@/types/options';

export const commitKeys = {
  SET_DATA: 'SET_DATA',
  SET_LAYOUTCONFIG: 'SET_LAYOUTCONFIG',
  SET_VIEWTYPE: 'SET_VIEWTYPE',
  SET_FREEZE_CONTAINER_EVT: 'SET_FREEZE_CONTAINER_EVT',
};
export const actionKeys = {};

type CalenderStore = {
  data: CalenderItem[];
  layoutConfig: LayoutConfig;
  viewType: ViewType;
  freezeContainerEvent: boolean;
};
const { StoreProvider, useStore, setStore, getStore, store } = createStore<CalenderStore>(
  {
    data: [],
    layoutConfig: {
      cellHeight: 42,
      interval: 30,
      gap: 8,
    },
    viewType: 'D',
    freezeContainerEvent: false,
  },
  {
    mutations: {
      [commitKeys.SET_DATA](state: CalenderStore, value: CalenderItem[]) {
        state.data = value;
      },
      [commitKeys.SET_LAYOUTCONFIG](state: CalenderStore, value: LayoutConfig) {
        state.layoutConfig = value;
      },

      [commitKeys.SET_VIEWTYPE](state: CalenderStore, value: ViewType) {
        state.viewType = value;
      },
      [commitKeys.SET_FREEZE_CONTAINER_EVT](state: CalenderStore, value: boolean) {
        state.freezeContainerEvent = value;
      },
    },
    actions: {},
  }
);

export { StoreProvider, useStore, setStore, getStore, store };
