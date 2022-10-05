import mapValues from "lodash/mapValues";
import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import { ModalStoreType, ModalKeysEnum, ScreenshotModalState } from "./types";

const initialState: ModalStoreType = {
  ...(mapValues(ModalKeysEnum, () => false) as Record<ModalKeysEnum, boolean>),
  [ModalKeysEnum.SCREENSHOTS]: { open: false, payload: { sliceIds: [] } },
};

// Actions Creators
export const modalCloseCreator = createAction("MODAL/CLOSE")<{
  modalKey: ModalKeysEnum;
}>();

export const modalOpenCreator = createAction("MODAL/OPEN")<{
  modalKey: ModalKeysEnum;
  payload?: ScreenshotModalState["payload"];
}>();

type ModalActions = ActionType<
  typeof modalCloseCreator | typeof modalOpenCreator
>;

// Selectors
export const isModalOpen = (
  state: SliceMachineStoreType,
  dialog: ModalKeysEnum
): boolean => {
  const modalState = state.modal[dialog];
  if (typeof modalState === "boolean") return modalState;
  else return modalState.open;
};

export const getModalPayload = (
  state: SliceMachineStoreType,
  dialog: ModalKeysEnum.SCREENSHOTS
) => {
  return state.modal[dialog].payload;
};

// Reducer
export const modalReducer: Reducer<ModalStoreType, ModalActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(modalCloseCreator):
      return {
        ...state,
        [action.payload.modalKey]: initialState[action.payload.modalKey],
      };
    case getType(modalOpenCreator):
      return {
        ...state,
        [action.payload.modalKey]: action.payload.payload
          ? { open: true, payload: action.payload.payload }
          : true,
      };
    default:
      return state;
  }
};
