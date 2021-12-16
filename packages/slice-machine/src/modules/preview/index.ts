import { Reducer } from "redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ActionType, createAction, getType } from "typesafe-actions";
import { PreviewStoreType } from "./types";

const NoStepSelected: number = 0;

export const initialState: PreviewStoreType = {
  setupStatus: {
    manifest: null,
    iframe: null,
    dependencies: null,
  },
  setupDrawer: {
    isOpen: false,
    openedStep: NoStepSelected,
  },
};

// Actions Creators
export const openSetupPreviewDrawerCreator = createAction(
  "PREVIEW/OPEN_SETUP_DRAWER"
)();

export const closeSetupPreviewDrawerCreator = createAction(
  "PREVIEW/CLOSE_SETUP_DRAWER"
)();

export const toggleSetupDrawerStepCreator = createAction(
  "PREVIEW/TOGGLE_SETUP_DRAWER_STEP"
)<{
  stepNumber: number;
}>();

type PreviewActions = ActionType<
  | typeof openSetupPreviewDrawerCreator
  | typeof closeSetupPreviewDrawerCreator
  | typeof toggleSetupDrawerStepCreator
>;

// Selectors
export const selectIsSetupDrawerOpen = (
  state: SliceMachineStoreType
): boolean => state.preview.setupDrawer.isOpen;

export const selectOpenedStep = (state: SliceMachineStoreType): number =>
  state.preview.setupDrawer.openedStep;

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
    case getType(toggleSetupDrawerStepCreator):
      return {
        ...state,
        setupDrawer: {
          ...state.setupDrawer,
          openedStep:
            state.setupDrawer.openedStep === action.payload.stepNumber
              ? NoStepSelected
              : action.payload.stepNumber,
        },
      };
    case getType(closeSetupPreviewDrawerCreator):
      return {
        ...state,
        setupDrawer: {
          openedStep: NoStepSelected,
          isOpen: false,
        },
      };
    default:
      return state;
  }
};
