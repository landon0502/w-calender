import { describe, it, expect } from 'vitest';
import Store from '@/store/Store';

describe('test store', () => {
  it('test store state update', () => {
    let state1 = { a: 1 };

    const store = Store.create(state1, {
      mutations: {
        testUpdate(state, newVal) {
          state.a = newVal;
        },
      },
    });
    let newState = store.getState();
    expect(newState).toEqual(state1);
    store.commit('testUpdate', 4);
    expect(store.getState()?.a).toEqual(4);
  });
});
