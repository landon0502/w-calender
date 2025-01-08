import { createStore } from '@/store';
import { CalenderItem } from '@/types/options';
const { StoreProvider, useStore, setStore } = createStore<{ data: CalenderItem[] }>({ data: [] });

export { StoreProvider, useStore, setStore };
