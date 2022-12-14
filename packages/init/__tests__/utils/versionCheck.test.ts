import { describe, expect, test } from "@jest/globals";

import { checkVersion } from "../../src/utils/versionCheck";

describe("versionCheck", () => {
  describe("checkVersion", () => {
    test("checks the version satisfies the threshold", () => {
      expect(checkVersion(">=13.0.0")).toBe(false);
      expect(checkVersion(">=13.0.0", undefined)).toBe(false);
      expect(checkVersion(">=13.0.0", "not-a-version")).toBe(false);
      expect(checkVersion(">=13.0.0", "12.3.4")).toBe(false);
      expect(checkVersion(">=13.0.0", "^12.3.4")).toBe(false);
      expect(checkVersion(">=13.0.0", "*")).toBe(false);
      expect(checkVersion(">=13.0.0", "13.5.6")).toBe(true);
      expect(checkVersion(">=13.0.0", "^13.0.0")).toBe(true);
      expect(checkVersion(">=13.0.0", "14.0.0")).toBe(true);
      expect(checkVersion(">=13.0.0", "^14.0.0")).toBe(true);
    });
  });
});
