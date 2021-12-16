import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import { PreviewStoreType } from "./types";

export const initialState: PreviewStoreType = {
  setupStatus: {
    manifest: null,
    iframe: null,
    dependencies: null,
  },
  setupDrawer: {
    isOpen: false,
    openedStep: 0,
  },
};

// Actions Creators
export const openSetupPreviewDrawerCreator = createAction(
  "PREVIEW/OPEN_SETUP_DRAWER"
)();

export const closeSetupPreviewDrawerCreator = createAction(
  "PREVIEW/CLOSE_SETUP_DRAWER"
)();

type PreviewActions = ActionType<
  typeof openSetupPreviewDrawerCreator | typeof closeSetupPreviewDrawerCreator
>;

// Selectors
export const selectIsSetupDrawerOpen = (
  state: SliceMachineStoreType
): boolean => state.preview.setupDrawer.isOpen;

// Reducer
export const previewReducer: Reducer<PreviewStoreType, PreviewActions> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case getType(openSetupPreviewDrawerCreator):
      return {
        ...state,
        setupDrawer: {
          ...state.setupDrawer,
          isOpen: true,
        },
      };
    case getType(closeSetupPreviewDrawerCreator):
      return {
        ...state,
        setupDrawer: {
          ...state.setupDrawer,
          isOpen: false,
        },
      };
    default:
      return state;
  }
};
