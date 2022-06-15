import "@testing-library/jest-dom";
import { simulatorIsSupported } from "@lib/utils";
import { Frameworks } from "@slicemachine/core/build/models";
import { slugify } from "@lib/utils/str";

describe("simulatorIsSupported", () => {
  test("Can create Storybook url from variation id", () => {
    expect(simulatorIsSupported(Frameworks.next)).toBeTruthy();
    expect(simulatorIsSupported(Frameworks.nuxt)).toBeTruthy();
    expect(simulatorIsSupported(Frameworks.vue)).toBeFalsy();
    expect(simulatorIsSupported(Frameworks.react)).toBeFalsy();
    expect(simulatorIsSupported(Frameworks.vanillajs)).toBeFalsy();
  });
});

describe("slugify", () => {
  test("returns the same string if valid", () => {
    expect(slugify("validstring")).toBe("validstring");
  });
  test("removes whitespaces at either end", () => {
    expect(slugify(" whitespaces ")).toBe("whitespacebefore");
  });
  test("converts spaces in the middle into hyphens", () => {
    expect(slugify("string with hyphens")).toBe("string-with-hyphens");
  });
  test("converts uppercase letters into lowecase", () => {
    expect(slugify("stringWithUppercases")).toBe("stringwithuppercases");
  });
  test("converts special characters", () => {
    expect(slugify("hèllo")).toBe("hello");
    expect(slugify("frõg")).toBe("frog");
  });
});
