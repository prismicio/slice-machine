import "@testing-library/jest-dom";

import {
  environmentReducer,
  refreshStateCreator,
} from "@src/modules/environment";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { dummyServerState } from "./__mocks__/serverState";

const dummyEnvironmentState: EnvironmentStoreType = dummyServerState.env;

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

    it("should update the environment state given STATE/REFRESH.RESPONSE action", () => {
      const action = refreshStateCreator({
        env: {
          ...dummyServerState.env,
          repo: "newUrl",
        },
        remoteCustomTypes: dummyServerState.remoteCustomTypes,
        localCustomTypes: dummyServerState.customTypes,
      });

      expect(environmentReducer(dummyEnvironmentState, action)).toEqual({
        ...dummyEnvironmentState,
        repo: "newUrl",
      });
    });
  });
});
