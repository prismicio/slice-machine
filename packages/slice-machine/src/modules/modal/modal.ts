import mapValues from "lodash/mapValues";
import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";

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

// Actions Creators
export const modalCloseCreator = createAction("MODAL/CLOSE")<{
  modalKey: ModalKeysEnum;
}>();

export const modalOpenCreator = createAction("MODAL/OPEN")<{
  modalKey: ModalKeysEnum;
}>();

type ModalActions = ActionType<
  typeof modalCloseCreator | typeof modalOpenCreator
>;

// Selectors
export const isModalOpen = (
  state: SliceMachineStoreType,
  dialog: ModalKeysEnum
) => state.modal.isOpen[dialog];

// Reducer
export const modalReducer: Reducer<ModalStoreType, ModalActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(modalCloseCreator):
      return {
        ...state,
        isOpen: {
          ...state.isOpen,
          [action.payload.modalKey]: false,
        },
      };
    case getType(modalOpenCreator):
      return {
        ...state,
        isOpen: {
          ...state.isOpen,
          [action.payload.modalKey]: true,
        },
      };
    default:
      return state;
  }
};
