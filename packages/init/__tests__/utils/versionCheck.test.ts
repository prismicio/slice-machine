import { describe, expect, test } from "@jest/globals";

import { checkVersion } from "../../src/utils/versionCheck";

describe("versionCheck", () => {
  describe("checkVersion", () => {
    test("checks the version satisfies the threshold", () => {
      expect(checkVersion(undefined, ">=13.0.0")).toBe(false);
      expect(checkVersion("not-a-version", ">=13.0.0")).toBe(false);
      expect(checkVersion("12.3.4", ">=13.0.0")).toBe(false);
      expect(checkVersion("^12.3.4", ">=13.0.0")).toBe(false);
      expect(checkVersion("*", ">=13.0.0")).toBe(false);
      expect(checkVersion("13.5.6", ">=13.0.0")).toBe(true);
      expect(checkVersion("^13.0.0", ">=13.0.0")).toBe(true);
      expect(checkVersion("14.0.0", ">=13.0.0")).toBe(true);
      expect(checkVersion("^14.0.0", ">=13.0.0")).toBe(true);
    });
  });
});
