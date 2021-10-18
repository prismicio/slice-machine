import { describe, expect, test } from "@jest/globals";
import { roles } from "../../../src/utils";

describe("canUpdateCutsomTypes", () => {
  test("should return true only if role is owner or admin", () => {
    Object.values(roles.Roles).forEach((role) => {
      const result = roles.canUpdateCustomTypes(role);
      const wanted = role === roles.Roles.ADMIN || role === roles.Roles.OWNER;
      return expect(result).toBe(wanted);
    });
  });
});
