import { describe, expect, it } from "vitest";

import { environmentReducer, refreshStateCreator } from "@/modules/environment";
import { EnvironmentStoreType } from "@/modules/environment/types";

import { dummyServerState } from "./__fixtures__/serverState";

const dummyEnvironmentState: EnvironmentStoreType = dummyServerState.env;

describe("[Environment module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(environmentReducer(dummyEnvironmentState, {})).toEqual(
        dummyEnvironmentState,
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"STAT... Remove this comment to see the full error message
        environmentReducer(dummyEnvironmentState, { type: "NO.MATCH" }),
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
  });
});
