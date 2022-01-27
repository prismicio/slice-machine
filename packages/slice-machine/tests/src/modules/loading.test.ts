import "@testing-library/jest-dom";

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
      expect(loadingReducer(dummyLoadingState, {})).toEqual(dummyLoadingState);
    });

    it("should return the initial state if no matching action", () => {
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
