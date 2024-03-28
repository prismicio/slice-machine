// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  initialState,
  simulatorReducer,
  connectToSimulatorIframeCreator,
} from "@src/modules/simulator";
import { SimulatorStoreType } from "@src/modules/simulator/types";

const dummySimulatorState: SimulatorStoreType = initialState;

describe("[Simulator module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(simulatorReducer(dummySimulatorState, {})).toEqual(
        dummySimulatorState,
      );
    });

    it("should return the initial state if no matching action", () => {
      expect(
        // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"SIMU... Remove this comment to see the full error message
        simulatorReducer(dummySimulatorState, { type: "NO.MATCH" }),
      ).toEqual(dummySimulatorState);
    });

    it("should update the state when given connectToSimulatorIframeCreator.success action", () => {
      const initialState: SimulatorStoreType = dummySimulatorState;

      const action = connectToSimulatorIframeCreator.success();

      const expectedState: SimulatorStoreType = {
        ...dummySimulatorState,
        iframeStatus: "ok",
      };

      expect(simulatorReducer(initialState, action)).toEqual(expectedState);
    });
  });
});
