import { describe, expect, it } from "vitest";

import {
  environmentReducer,
  getChangelog,
  getChangelogCreator,
  refreshStateCreator,
} from "@src/modules/environment";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { dummyServerState } from "./__fixtures__/serverState";
import { SliceMachineStoreType } from "@src/redux/type";

const dummyEnvironmentState: EnvironmentStoreType = dummyServerState.env;

describe("[Environment module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(environmentReducer(dummyEnvironmentState, {})).toEqual(
        dummyEnvironmentState
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"STAT... Remove this comment to see the full error message
        environmentReducer(dummyEnvironmentState, { type: "NO.MATCH" })
      ).toEqual(dummyEnvironmentState);
    });

    it("should update the environment state given STATE/REFRESH.RESPONSE action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{ env: { repo: string; shortId?:... Remove this comment to see the full error message
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
        sliceMachine: {
          currentVersion: "1.0.0",
          updateAvailable: true,
          latestNonBreakingVersion: "0.1.2",
          versions: [],
        },
        adapter: {
          name: "test-adapter",
          updateAvailable: true,
          versions: [],
        },
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
        sliceMachine: {
          currentVersion: "",
          latestNonBreakingVersion: null,
          updateAvailable: false,
          versions: [],
        },
        adapter: {
          name: "",
          updateAvailable: false,
          versions: [],
        },
      });
    });
  });
});
