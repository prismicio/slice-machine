import "@testing-library/jest-dom";

import {
  modalReducer,
  modalOpenCreator,
  modalCloseCreator,
} from "@src/modules/modal";
import { ModalKeysEnum, ModalStoreType } from "@src/modules/modal/types";

describe("[Modal module]", () => {
  describe("[Reducer]", () => {
    it("should return the initial state if no action", () => {
      expect(modalReducer({}, {})).toEqual({});
    });

    it("should return the initial state if no matching action", () => {
      expect(modalReducer({}, { type: "NO.MATCH" })).toEqual({});
    });

    it("should update state to true when given MODAL/OPEN action", () => {
      const initialState: ModalStoreType = {
        [ModalKeysEnum.LOGIN]: false,
      };

      const action = modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN });

      const expectedState = {
        [ModalKeysEnum.LOGIN]: true,
      };

      expect(modalReducer(initialState, action)).toEqual(expectedState);
    });

    it("should update state to false when given MODAL/CLOSE action", () => {
      const initialState = {
        [ModalKeysEnum.LOGIN]: true,
      };

      const action = modalCloseCreator({ modalKey: ModalKeysEnum.LOGIN });

      const expectedState = {
        [ModalKeysEnum.LOGIN]: false,
      };

      expect(modalReducer(initialState, action)).toEqual(expectedState);
    });
  });
});
