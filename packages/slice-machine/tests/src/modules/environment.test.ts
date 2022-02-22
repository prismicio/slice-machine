import "@testing-library/jest-dom";

import {
  environmentReducer,
  refreshStateCreator,
} from "@src/modules/environment";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { dummyServerState } from "./__mocks__/serverState";

const dummyEnvironmentState: EnvironmentStoreType = {
  env: dummyServerState.env,
  warnings: [],
  configErrors: {},
};

describe("[Environment module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(environmentReducer(dummyEnvironmentState, {})).toEqual(
        dummyEnvironmentState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        environmentReducer(dummyEnvironmentState, { type: "NO.MATCH" })
      ).toEqual(dummyEnvironmentState);
    });

    it("should update the environment state given STATE/GET.RESPONSE action", () => {
      const action = refreshStateCreator({
        env: {
          ...dummyServerState.env,
          repo: "newUrl",
        },
        configErrors: dummyServerState.configErrors,
        warnings: dummyServerState.warnings,
        remoteCustomTypes: dummyServerState.remoteCustomTypes,
        localCustomTypes: dummyServerState.customTypes,
      });

      expect(environmentReducer(dummyEnvironmentState, action)).toEqual({
        ...dummyEnvironmentState,
        env: {
          ...dummyEnvironmentState.env,
          repo: "newUrl",
        },
      });
    });
  });
});
