// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { slicesReducer } from "@/modules/slices";
import { SlicesStoreType } from "@/modules/slices/types";

const dummySlicesState: SlicesStoreType = {
  libraries: [],
  remoteSlices: [],
};

describe("[Slices module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(slicesReducer(dummySlicesState, {})).toEqual(dummySlicesState);
    });

    it("should return the initial state if no matching action", () => {
      // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"STAT... Remove this comment to see the full error message
      expect(slicesReducer(dummySlicesState, { type: "NO.MATCH" })).toEqual(
        dummySlicesState,
      );
    });
  });
});
