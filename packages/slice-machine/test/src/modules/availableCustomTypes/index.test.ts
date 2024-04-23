import { describe, expect, it } from "vitest";

import { availableCustomTypesReducer } from "@/modules/availableCustomTypes";
import { AvailableCustomTypesStoreType } from "@/modules/availableCustomTypes/types";
import { refreshStateCreator } from "@/modules/environment";

import { dummyServerState } from "../__fixtures__/serverState";

const dummyCustomTypesState: AvailableCustomTypesStoreType = {};

describe("[Available Custom types module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(availableCustomTypesReducer(dummyCustomTypesState, {})).toEqual(
        dummyCustomTypesState,
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        availableCustomTypesReducer(dummyCustomTypesState, {
          // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"CUST... Remove this comment to see the full error message
          type: "NO.MATCH",
        }),
      ).toEqual(dummyCustomTypesState);
    });

    it("should update the custom types state given STATE/GET.RESPONSE action", () => {
      const action = refreshStateCreator({
        env: dummyServerState.env,
        remoteCustomTypes: dummyServerState.remoteCustomTypes,
        localCustomTypes: dummyServerState.customTypes,
        libraries: dummyServerState.libraries,
        // @ts-expect-error TS(2322) FIXME: Type 'readonly ({ id: string; label: string | null... Remove this comment to see the full error message
        remoteSlices: dummyServerState.remoteCustomTypes,
      });

      expect(
        availableCustomTypesReducer(dummyCustomTypesState, action),
      ).toEqual({
        ...dummyCustomTypesState,
        about: {
          local: dummyServerState.customTypes[0],
        },
      });
    });
  });
});
