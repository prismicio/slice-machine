import {
  loadingReducer,
  startLoadingActionCreator,
  stopLoadingActionCreator,
} from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

describe("[Loading module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(loadingReducer({}, {})).toEqual({});
    });

    it("should return the initial state if no matching action", () => {
      expect(loadingReducer({}, { type: "NO.MATCH" })).toEqual({});
    });

    it("should update state to true when given LOADING/START action", () => {
      const initialState = {
        [LoadingKeysEnum.LOGIN]: false,
      };

      const action = startLoadingActionCreator({
        loadingKey: LoadingKeysEnum.LOGIN,
      });

      const expectedState = {
        [LoadingKeysEnum.LOGIN]: true,
      };

      expect(loadingReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update state to false when given LOADING/STOP action", () => {
      const initialState = {
        [LoadingKeysEnum.LOGIN]: true,
      };

      const action = stopLoadingActionCreator({
        loadingKey: LoadingKeysEnum.LOGIN,
      });

      const expectedState = {
        [LoadingKeysEnum.LOGIN]: false,
      };

      expect(loadingReducer(initialState, action)).toEqual(expectedState);
    });
  });
});
