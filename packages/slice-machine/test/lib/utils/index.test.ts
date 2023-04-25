import { describe, test, expect } from "vitest";
import { slugify } from "@lib/utils/str";

describe("slugify", () => {
  test("returns the same string if valid", () => {
    expect(slugify("validstring")).toBe("validstring");
  });
  test("removes whitespaces at either end", () => {
    expect(slugify(" whitespaces ")).toBe("whitespaces");
  });
  test("converts spaces in the middle into hyphens", () => {
    expect(slugify("string with hyphens")).toBe("string_with_hyphens");
  });
  test("converts uppercase letters into lowercase", () => {
    expect(slugify("stringWithUppercases")).toBe("stringwithuppercases");
  });
  test("converts special characters", () => {
    expect(slugify("hèllo")).toBe("hello");
    expect(slugify("frõg")).toBe("frog");
  });
});
