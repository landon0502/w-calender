import { expect, test } from 'vitest';
import bus from '../src/utils/bus';
let num = 0;

function testFunc(v: number) {
  num = v;
}

const busTest = test.extend({
  bus,
  key: Symbol('testOnEvent'),
});

busTest('test bus $emit and $on', ({ bus, key }) => {
  bus.$on(key, testFunc);
  bus.$emit(key, 10);
  expect(num).toBe(10);
});

busTest('test bus $has', ({ key, bus }) => {
  expect(bus.$has(key, testFunc)).toBe(true);
});

busTest('test bus $off', ({ key, bus }) => {
  bus.$off(key, testFunc);
  expect(bus.$has(key, testFunc)).toBe(false);
});

busTest('test empty callback params  of bus $off', ({ key, bus }) => {
  bus.$off(key);
  expect(bus.$has(key)).toBe(false);
});

busTest('test empty params of bus $off', ({ key, bus }) => {
  bus.$off();
  expect(bus.$has(key)).toBe(false);
});

busTest('test bus $once', ({ bus }) => {
  function testFunc1(v: number) {
    num = v;
  }
  let key = Symbol('once');
  bus.$once(key, testFunc1);

  expect(bus.$has(key, testFunc1)).toBe(false);
});

busTest('test bus $clear', ({ key, bus }) => {
  function testFunc1(v: number) {
    num = v;
  }
  bus.$on(Symbol('once'), testFunc1);
  bus.$clear();
  expect(bus.$has(key, testFunc1)).toBe(false);
});
