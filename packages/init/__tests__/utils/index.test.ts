import { expect, test, describe } from "@jest/globals";

import { findArgument, findFlag } from "../../src/utils";

describe("findArgument", () => {
  test("should send undefined if there is no args", () => {
    const argument = findArgument([], "toto");
    expect(argument).toBeUndefined();
  });
  test("should send the arg value if there is  a match", () => {
    const argument = findArgument(["--base", "wroom.io"], "base");
    expect(argument).toBe("wroom.io");
  });
  test("should send undefined if there is no match", () => {
    const argument = findArgument(["--base", "wroom.io"], "toto");
    expect(argument).toBeUndefined();
  });
  test("repository argument", () => {
    const arg = findArgument(["--repository", "foo-bar"], "repository");
    expect(arg).toEqual("foo-bar");
  });
});

describe("findFlag", () => {
  test("it should return true when flag is found in the args", () => {
    const want = true;
    const got = findFlag(["--foo"], "foo");
    expect(got).toEqual(want);
  });

  test("it should return false when flag is not found", () => {
    const want = false;
    const got = findFlag(["--bar", "baz", "--boop"], "foo");
    expect(got).toEqual(want);
  });
});
