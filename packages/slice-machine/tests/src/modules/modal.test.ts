import "@testing-library/jest-dom";

import {
  modalReducer,
  modalOpenCreator,
  modalCloseCreator,
  initialState as modalInitialState,
} from "@src/modules/modal";
import { ModalKeysEnum, ModalStoreType } from "@src/modules/modal/types";

describe("[Modal module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(modalReducer(undefined, {})).toEqual(modalInitialState);
    });

    it("should return the initial state if no matching action", () => {
      expect(modalReducer(undefined, { type: "NO.MATCH" })).toEqual(
        modalInitialState
      );
    });

    it("should update state to true when given MODAL/OPEN action", () => {
      const state: ModalStoreType = {
        ...modalInitialState,
        [ModalKeysEnum.LOGIN]: false,
      };

      const action = modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN });

      const expectedState = {
        ...modalInitialState,
        [ModalKeysEnum.LOGIN]: true,
      };

      expect(modalReducer(state, action)).toEqual(expectedState);
    });

    it("should update state to false when given MODAL/CLOSE action", () => {
      const state = {
        ...modalInitialState,
        [ModalKeysEnum.LOGIN]: true,
      };

      const action = modalCloseCreator();

      const expectedState = {
        ...modalInitialState,
        [ModalKeysEnum.LOGIN]: false,
      };

      expect(modalReducer(state, action)).toEqual(expectedState);
    });
  });
});
