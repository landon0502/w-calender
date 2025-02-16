import { createStore } from '@/store';
import { Template } from '@/templates/RenderTemplate';
export const templateCommitKeys = {
  SET_TEMPLATES: 'SET_TEMPLATES',
};

export const templateActionKeys = {};
interface TemplateStore {
  templates: Record<string, Template>;
}
const {
  StoreProvider: TemplateProvider,
  useStore: useTemplateStore,
  setStore: setTemplateStore,
  getStore: getTemplateStore,
  store: templateStore,
} = createStore<TemplateStore>(
  {
    templates: {},
  },
  {
    mutations: {
      [templateCommitKeys.SET_TEMPLATES](state, value: Record<string, Template>) {
        state.templates = value;
      },
    },
    actions: {},
  }
);

export { TemplateProvider, useTemplateStore, setTemplateStore, getTemplateStore, templateStore };
