import mapValues from "lodash/mapValues";
import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import { ModalStoreType, ModalKeysEnum } from "./types";

export const initialState: ModalStoreType = {
  ...(mapValues(ModalKeysEnum, () => false) as Record<ModalKeysEnum, boolean>),
};

// Actions Creators
export const modalCloseCreator = createAction("MODAL/CLOSE")();

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
): boolean => state.modal[dialog];

// Reducer
export const modalReducer: Reducer<ModalStoreType, ModalActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(modalCloseCreator):
      return initialState;
    case getType(modalOpenCreator):
      return {
        ...initialState,
        [action.payload.modalKey]: true,
      };
    default:
      return state;
  }
};
