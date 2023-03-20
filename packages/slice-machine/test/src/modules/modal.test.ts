import { describe, expect, it } from "vitest";

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
      // @ts-expect-error TS(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
      expect(modalReducer(undefined, {})).toEqual(modalInitialState);
    });

    it("should return the initial state if no matching action", () => {
      // @ts-expect-error TS(2322) FIXME: Type '"NO.MATCH"' is not assignable to type '"MODA... Remove this comment to see the full error message
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
