import { createStore } from '@/store';
import { CalenderItem } from '@/types/options';

export const COMMIT_KEY = {};
export const ACTION_KEY = {};
const { StoreProvider, useStore, setStore, getStore } = createStore<{ data: CalenderItem[] }>(
  {
    data: [],
  },
  {
    mutations: {},
    actions: {},
  }
);

export { StoreProvider, useStore, setStore, getStore };
