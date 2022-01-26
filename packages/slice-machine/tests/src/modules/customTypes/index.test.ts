import { customTypesReducer } from "@src/modules/customTypes";
import { CustomTypesStoreType } from "@src/modules/customTypes/types";
import { getStateCreator } from "@src/modules/environment";
import "@testing-library/jest-dom";

import { dummyServerState } from "../__mocks__/serverState";

const dummyCustomTypesState: CustomTypesStoreType = {
  localCustomTypes: [],
  remoteCustomTypes: [],
};

describe("[Custom types module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(customTypesReducer(dummyCustomTypesState, {})).toEqual(
        dummyCustomTypesState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        customTypesReducer(dummyCustomTypesState, { type: "NO.MATCH" })
      ).toEqual(dummyCustomTypesState);
    });

    it("should update the custom types state given STATE/GET.RESPONSE action", () => {
      const action = getStateCreator({
        env: dummyServerState.env,
        configErrors: dummyServerState.configErrors,
        warnings: dummyServerState.warnings,
        remoteCustomTypes: dummyServerState.remoteCustomTypes,
        localCustomTypes: dummyServerState.customTypes,
      });

      expect(customTypesReducer(dummyCustomTypesState, action)).toEqual({
        ...dummyCustomTypesState,
        localCustomTypes: dummyServerState.customTypes,
      });
    });
  });
});
