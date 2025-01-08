import { expect, describe, it } from 'vitest';

import {
  isEmpty,
  isUndef,
  cls,
  createUniqueId,
  deepClone,
  arrayGroupByValue,
  unref,
} from '../src/utils';
import { CSS_PREFIX } from '../src/utils/css';

describe('test utils', () => {
  it('test isEmpty util', () => {
    let res1 = isEmpty({});
    let res2 = isEmpty([]);
    expect([res1, res2]).toEqual([true, true]);
  });

  it('test isUndef util', () => {
    let res1 = isUndef('');
    let res2 = isUndef(void 0);
    expect([res1, res2]).toEqual([false, true]);
  });

  describe('test cls util', () => {
    it('test cls string parameter', () => {
      let className1 = cls('a');
      expect(className1).toBe(`${CSS_PREFIX}-a`);
    });
    it('test cls array parameter', () => {
      let className2 = cls(['a']);
      expect(className2).toBe(`${CSS_PREFIX}-a`);
    });
    it('test cls array parameter exists undefined ', () => {
      let className2 = cls(['a', void 0]);
      expect(className2).toBe(`${CSS_PREFIX}-a`);
    });

    it('test cls array is []', () => {
      let className2 = cls([]);
      expect(className2).toBe('');
    });

    it('test cls parameter has prefix', () => {
      let className2 = cls(`${CSS_PREFIX}-a`);
      expect(className2).toBe(`${CSS_PREFIX}-a`);
    });
  });

  it('test createUniqueId util', () => {
    let uuid1 = createUniqueId();
    let uuid2 = createUniqueId();
    let uuid3 = createUniqueId(100);
    expect(uuid1).not.toBe(uuid2);
    expect(uuid1).not.toBe(uuid3);
    expect(uuid2).not.toBe(uuid3);
  });

  it('test deepClone util', () => {
    let source = { a: 1 };
    let copy = deepClone(source);
    expect(copy).not.toBe(source);
    expect(copy).toEqual(source);
  });

  it('test arrayGroupByValue util', () => {
    let source = [
      { label: '1', g: 1 },
      { label: '1', g: 1 },
      { label: '2', g: 2 },
      { label: '22', g: 2 },
    ];
    let res = arrayGroupByValue(source, 'g');

    expect(res).toEqual([
      {
        group: [
          {
            g: 1,
            label: '1',
          },
          {
            g: 1,
            label: '1',
          },
        ],
        groupValue: 1,
      },
      {
        group: [
          {
            g: 2,
            label: '2',
          },
          {
            g: 2,
            label: '22',
          },
        ],
        groupValue: 2,
      },
    ]);
  });

  it('test unref util', () => {
    let result = { current: 1 };
    let res = unref(result);
    let source1 = 1;
    let res1 = unref(source1);
    expect(res).toBe(1);
    expect(result.current).toBe(1);
    expect(source1).toEqual(res1);
  });
});
