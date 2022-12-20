import "@testing-library/jest-dom";

import {
  environmentReducer,
  getChangelog,
  getChangelogCreator,
  refreshStateCreator,
} from "@src/modules/environment";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { dummyServerState } from "./__mocks__/serverState";
import { SliceMachineStoreType } from "@src/redux/type";

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

    it("should update the environment state given CHANGELOG.RESPONSE action", () => {
      const newChangeLog = {
        currentVersion: "1.0.0",
        updateAvailable: true,
        latestNonBreakingVersion: "0.1.2",
        versions: [],
      };
      const action = getChangelogCreator.success({
        changelog: newChangeLog,
      });

      expect(environmentReducer(dummyEnvironmentState, action)).toEqual({
        ...dummyEnvironmentState,
        changelog: newChangeLog,
      });
    });
  });

  describe("[Selector]", () => {
    it("returns the changelog currently in the store", () => {
      const sliceMachineStore = {
        environment: dummyEnvironmentState,
      } as SliceMachineStoreType;
      const result = getChangelog(sliceMachineStore);
      expect(result).toEqual(dummyEnvironmentState.changelog);
    });

    it("returns the default changelog when there isn't one in the store", () => {
      const sliceMachineStore = {
        environment: {},
      } as SliceMachineStoreType;
      const result = getChangelog(sliceMachineStore);
      expect(result).toEqual({
        currentVersion: "",
        latestNonBreakingVersion: null,
        updateAvailable: false,
        versions: [],
      });
    });
  });
});
