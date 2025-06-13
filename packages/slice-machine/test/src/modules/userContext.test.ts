import { describe, expect, it } from "vitest";

import { userContextReducer } from "@/modules/userContext";

describe("[UserContext module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(userContextReducer({}, {})).toEqual({});
    });

    it("should return the initial state if no matching action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(userContextReducer({}, { type: "NO.MATCH" })).toEqual({});
    });
  });
});
