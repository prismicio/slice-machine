import { describe, expect, it } from "vitest";

import {
  loadingReducer,
  startLoadingActionCreator,
  stopLoadingActionCreator,
} from "@src/modules/loading";
import { LoadingKeysEnum, LoadingStoreType } from "@src/modules/loading/types";
import { initialState } from "@src/modules/loading";

const dummyLoadingState: LoadingStoreType = initialState;

describe("[Loading module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(loadingReducer(dummyLoadingState, {})).toEqual(dummyLoadingState);
    });

    it("should return the initial state if no matching action", () => {
      // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"LOAD... Remove this comment to see the full error message
      expect(loadingReducer(dummyLoadingState, { type: "NO.MATCH" })).toEqual(
        dummyLoadingState
      );
    });

    it("should update the state to true when given startLoadingActionCreator action", () => {
      const initialState = {
        ...dummyLoadingState,
        [LoadingKeysEnum.LOGIN]: false,
      };

      const action = startLoadingActionCreator({
        loadingKey: LoadingKeysEnum.LOGIN,
      });

      const expectedState = {
        ...dummyLoadingState,
        [LoadingKeysEnum.LOGIN]: true,
      };

      expect(loadingReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update the state to false when given stopLoadingActionCreator action", () => {
      const initialState = {
        ...dummyLoadingState,
        [LoadingKeysEnum.LOGIN]: true,
      };

      const action = stopLoadingActionCreator({
        loadingKey: LoadingKeysEnum.LOGIN,
      });

      const expectedState = {
        ...dummyLoadingState,
        [LoadingKeysEnum.LOGIN]: false,
      };

      expect(loadingReducer(initialState, action)).toEqual(expectedState);
    });
  });
});
