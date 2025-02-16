import { createStore } from '@/store';
export const lanuageCommitKeys = {
  SET_LANUAGE: 'SET_LANUAGE',
  SET_LOCALE: 'SET_LOCALE',
  SET_LOCALE_LANUAGE: 'SET_LOCALE_LANUAGE',
};

export const lanuageActionKeys = {};
export type LanuageDict = Record<string, Record<string, string>>;
interface LanuageStore {
  dict: LanuageDict;
  locale: string;
}
const {
  StoreProvider: LanuageProvider,
  useStore: useLanuageStore,
  setStore: setLanuageStore,
  getStore: getLanuageStore,
  store: lanuageStore,
} = createStore<LanuageStore>(
  {
    dict: {},
    locale: 'zh',
  },
  {
    mutations: {
      [lanuageCommitKeys.SET_LANUAGE](state, value: LanuageDict) {
        state.dict = value;
      },
      [lanuageCommitKeys.SET_LOCALE_LANUAGE](state, locale: string, value: Record<string, string>) {
        state.dict[locale] = value;
      },
      [lanuageCommitKeys.SET_LOCALE](state, value: string) {
        state.locale = value;
      },
    },
    actions: {},
  }
);

export { LanuageProvider, useLanuageStore, setLanuageStore, getLanuageStore, lanuageStore };
