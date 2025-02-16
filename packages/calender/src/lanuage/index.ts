import {
  useLanuageStore,
  lanuageStore,
  lanuageCommitKeys,
  LanuageProvider,
} from '@/contexts/lanuageStore';
import type { LanuageDict } from '@/contexts/lanuageStore';
function setLanuageLocale(locale: string) {
  lanuageStore.commit(lanuageCommitKeys.SET_LOCALE, locale);
}
function setLanuageLocaleDict(locale: string, dict: Record<string, string>) {
  lanuageStore.commit(lanuageCommitKeys.SET_LOCALE_LANUAGE, locale, dict);
}

function setLanuageDict(dict: LanuageDict) {
  lanuageStore.commit(lanuageCommitKeys.SET_LANUAGE, dict);
}

function useI18n() {
  const { getState } = useLanuageStore();

  function t(code: string) {
    const dict = getState('dict');
    const locale = getState('locale');
    const currentDict = dict[locale];
    return currentDict?.[code];
  }
  return { t };
}

export { LanuageProvider, setLanuageDict, setLanuageLocaleDict, setLanuageLocale, useI18n };
