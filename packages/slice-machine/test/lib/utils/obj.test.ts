import { describe, test, expect } from "vitest";
import { deepMerge } from "../../../lib/utils/obj";

describe("deepMerge", () => {
  test("shallow value - updates value", () => {
    const obj1 = { val1: 50, val2: 60 };
    const obj2 = { val2: "hello" };
    const expected = { val1: 50, val2: "hello" };
    expect(deepMerge(obj1, obj2)).toStrictEqual(expected);
    expect(obj1).toStrictEqual({ val1: 50, val2: 60 });
    expect(obj2).toStrictEqual({ val2: "hello" });
  });
  test("shallow value - ignores values defined as undefined", () => {
    const obj1 = { val1: 50, val2: 60 };
    const obj2 = { val2: undefined };
    const expected = { val1: 50, val2: 60 };
    expect(deepMerge(obj1, obj2)).toStrictEqual(expected);
    expect(obj1).toStrictEqual({ val1: 50, val2: 60 });
    expect(obj2).toStrictEqual({ val2: undefined });
  });
  test("shallow value - adds value if not present in the first object", () => {
    const obj1 = { val1: 50, val2: 60 };
    const obj2 = { val3: 0 };
    const expected = { val1: 50, val2: 60, val3: 0 };
    expect(deepMerge(obj1, obj2)).toStrictEqual(expected);
    expect(obj1).toStrictEqual({ val1: 50, val2: 60 });
    expect(obj2).toStrictEqual({ val3: 0 });
  });
  test("nested value - updates value", () => {
    const obj1 = { val1: 50, val2: { nested1: 1, nested2: 2 } };
    const obj2 = { val2: { nested2: false } };
    const expected = { val1: 50, val2: { nested1: 1, nested2: false } };
    expect(deepMerge(obj1, obj2)).toStrictEqual(expected);
    expect(obj1).toStrictEqual({ val1: 50, val2: { nested1: 1, nested2: 2 } });
    expect(obj2).toStrictEqual({ val2: { nested2: false } });
  });
  test("nested value - ignores values defined as undefined", () => {
    const obj1 = { val1: 50, val2: { nested1: 1, nested2: 2 } };
    const obj2 = { val2: { nested2: undefined } };
    const expected = { val1: 50, val2: { nested1: 1, nested2: 2 } };
    expect(deepMerge(obj1, obj2)).toStrictEqual(expected);
    expect(obj1).toStrictEqual({ val1: 50, val2: { nested1: 1, nested2: 2 } });
    expect(obj2).toStrictEqual({ val2: { nested2: undefined } });
  });
  test("nested value - adds value if not present in the first object", () => {
    const obj1 = { val1: 50, val2: { nested1: 1, nested2: 2 } };
    const obj2 = { val2: { nested3: { deepNest: 100 } } };
    const expected = {
      val1: 50,
      val2: { nested1: 1, nested2: 2, nested3: { deepNest: 100 } },
    };
    expect(deepMerge(obj1, obj2)).toStrictEqual(expected);
    expect(obj1).toStrictEqual({ val1: 50, val2: { nested1: 1, nested2: 2 } });
    expect(obj2).toStrictEqual({ val2: { nested3: { deepNest: 100 } } });
  });
});
