import mapValues from "lodash/mapValues";
import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";

export enum ModalKeysEnum {
  LOGIN = "LOGIN",
}

export type ModalStoreType = {
  isOpen: Record<ModalKeysEnum, boolean>;
};

const initialState: ModalStoreType = {
  isOpen: mapValues(ModalKeysEnum, () => false) as Record<
    ModalKeysEnum,
    boolean
  >,
};

const actionTypes = {
  MODAL: {
    CLOSE: "MODAL.CLOSE",
    OPEN: "MODAL.OPEN",
  },
};

// Actions Creators
export const modalCloseCreator = (dialog: ModalKeysEnum) => ({
  type: actionTypes.MODAL.CLOSE,
  dialog,
});

export const modalOpenCreator = (dialog: ModalKeysEnum) => ({
  type: actionTypes.MODAL.OPEN,
  dialog,
});

// Selectors
export const isModalOpen = (
  state: SliceMachineStoreType,
  dialog: ModalKeysEnum
) => state.modal.isOpen[dialog];

// Reducer
export const modalReducer: Reducer<ModalStoreType> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case actionTypes.MODAL.CLOSE:
      return {
        ...state,
        isOpen: {
          ...state.isOpen,
          [action.dialog]: false,
        },
      };
    case actionTypes.MODAL.OPEN:
      return {
        ...state,
        isOpen: {
          ...state.isOpen,
          [action.dialog]: true,
        },
      };
    default:
      return state;
  }
};
