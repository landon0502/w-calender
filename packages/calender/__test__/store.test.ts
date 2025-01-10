import { describe, it, expect, vi } from 'vitest';
import Store from '../src/store/Store';

describe('test store', () => {
  it('test store commit', () => {
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
    store.commit('testUpdate', 5);
    expect(store.getState()?.a).toEqual(5);
  });

  it('test store dispatch', async () => {
    let state1 = { a: 1 };
    let delay = 300;
    const store = Store.create(state1, {
      mutations: {
        testUpdate(state, newVal) {
          state.a = newVal;
        },
      },
      actions: {
        async updateA({ commit }, value) {
          commit('testUpdate', value);
        },
      },
    });

    await vi.waitFor(() => store.dispatch('updateA', 10), {
      timeout: delay,
    });

    expect(store.getState()?.a).toEqual(10);
  });

  it('test store observe', async () => {
    let state1 = { a: 1 };
    let delay = 300;
    const store = Store.create(state1, {
      mutations: {
        testUpdate(state, newVal) {
          state.a = newVal;
        },
      },
      actions: {
        async updateA({ commit }, value) {
          return new Promise((resolve) => {
            setTimeout(() => {
              commit('testUpdate', value);
              resolve();
            }, delay);
          });
        },
      },
    });

    store.observe((state: { a: any }) => {
      expect(state?.a).toEqual(10);
    });

    await store.dispatch('updateA', 10);

    expect(store.getState()?.a).toEqual(10);
  });

  it('test store destory', () => {
    let state1 = { a: 1 };
    const store = Store.create(state1, {
      mutations: {
        testUpdate(state, newVal) {
          state.a = newVal;
        },
      },
    });
    store.destory();
    expect(store.getState()?.a).not.toBe(state1.a);
  });
});
