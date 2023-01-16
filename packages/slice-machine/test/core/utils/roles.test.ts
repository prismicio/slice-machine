import { describe, expect, test } from "vitest";
import { Roles, canUpdateCustomTypes } from "../../../core/models";

describe("canUpdateCutsomTypes", () => {
  test("should return true only if role is owner or admin", () => {
    Object.values(Roles).forEach((role) => {
      const result = canUpdateCustomTypes(role);
      const wanted =
        role === Roles.ADMIN ||
        role === Roles.OWNER ||
        role === Roles.SUPERUSER;
      return expect(result).toBe(wanted);
    });
  });
});
