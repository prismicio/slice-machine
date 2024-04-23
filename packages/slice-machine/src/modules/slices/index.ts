import { Reducer } from "redux";
import { ActionType, createAction, getType } from "typesafe-actions";

import { SaveSliceMockRequest } from "@/apiClient";
import {
  ComponentUI,
  ScreenshotUI,
} from "@/legacy/lib/models/common/ComponentUI";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { LocalOrRemoteSlice } from "@/legacy/lib/models/common/ModelData";
import { normalizeFrontendSlices } from "@/legacy/lib/models/common/normalizers/slices";
import { SliceSM } from "@/legacy/lib/models/common/Slice";
import { refreshStateCreator } from "@/modules/environment";
import { SliceMachineStoreType } from "@/redux/type";

import { SlicesStoreType } from "./types";

// Action Creators
export const sliceCreateSuccess = createAction("SLICES/CREATE_SUCCESS")<{
  libraries: Readonly<LibraryUI[]>;
}>();

export const sliceRenameSuccess = createAction("SLICES/RENAME_SUCCESS")<{
  libName: string;
  renamedSlice: SliceSM;
}>();

export const sliceDeleteSuccess = createAction("SLICES/DELETE_SUCCESS")<{
  sliceId: string;
  libName: string;
}>();

export const sliceUpdateSuccess = createAction("SLICE/UPDATE_SUCCESS")<{
  component: ComponentUI;
}>();

export const sliceGenerateCustomScreenshotSuccess = createAction(
  "SLICE/GENERATE_CUSTOM_SCREENSHOT_SUCCESS",
)<{ variationId: string; screenshot: ScreenshotUI; component: ComponentUI }>();

export const sliceUpdateMockSuccess = createAction(
  "SLICE/UPDATE_MOCK_SUCCESS",
)<SaveSliceMockRequest>();

type SlicesActions =
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof sliceCreateSuccess>
  | ActionType<typeof sliceRenameSuccess>
  | ActionType<typeof sliceDeleteSuccess>
  | ActionType<typeof sliceUpdateSuccess>
  | ActionType<typeof sliceGenerateCustomScreenshotSuccess>
  | ActionType<typeof sliceUpdateMockSuccess>;

// Selectors
export const getLibraries = (
  store: SliceMachineStoreType,
): ReadonlyArray<LibraryUI> => store.slices.libraries;

export const getRemoteSlice = (
  store: SliceMachineStoreType,
  componentId: string,
): SliceSM | undefined => {
  return store.slices.remoteSlices.find((rs) => rs.id === componentId);
};

export const getRemoteSlices = (
  store: SliceMachineStoreType,
): ReadonlyArray<SliceSM> => store.slices.remoteSlices;

export const getFrontendSlices = (
  store: SliceMachineStoreType,
): LocalOrRemoteSlice[] =>
  normalizeFrontendSlices(store.slices.libraries, getRemoteSlices(store));

// Reducer
export const slicesReducer: Reducer<SlicesStoreType | null, SlicesActions> = (
  state,
  action,
) => {
  if (!state) return null;

  switch (action.type) {
    case getType(refreshStateCreator):
      return {
        ...state,
        libraries: action.payload.libraries,
        remoteSlices: action.payload.remoteSlices,
      };
    case getType(sliceCreateSuccess):
      return {
        ...state,
        libraries: action.payload.libraries,
      };
    case getType(sliceRenameSuccess): {
      const { libName, renamedSlice } = action.payload;
      const newLibs = state.libraries.map((library) => {
        if (library.name !== libName) return library;
        return {
          ...library,
          components: library.components.map((component) => {
            if (component.model.id !== renamedSlice.id) return component;

            return {
              ...component,
              model: renamedSlice,
            };
          }),
        };
      });
      return {
        ...state,
        libraries: newLibs,
      };
    }
    case getType(sliceUpdateSuccess): {
      const newComponentUI = action.payload.component;

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== newComponentUI.from) return library;
        return {
          ...library,
          components: library.components.map((component) => {
            return component.model.id !== newComponentUI.model.id
              ? component
              : newComponentUI;
          }),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    case getType(sliceGenerateCustomScreenshotSuccess): {
      const { component, screenshot, variationId } = action.payload;

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== component.from) return library;
        return {
          ...library,
          components: library.components.map((c) =>
            c.model.id === component.model.id
              ? {
                  ...component,
                  screenshots: {
                    ...component.screenshots,
                    [variationId]: screenshot,
                  },
                }
              : c,
          ),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    case getType(sliceDeleteSuccess): {
      const { libName, sliceId } = action.payload;
      const newLibs = state.libraries.map((library) => {
        if (library.name !== libName) return library;
        return {
          ...library,
          components: library.components.filter(
            (component) => component.model.id !== sliceId,
          ),
        };
      });
      return {
        ...state,
        libraries: newLibs,
      };
    }

    case getType(sliceUpdateMockSuccess): {
      const { libraryID, sliceID, mocks } = action.payload;
      const libraries = state.libraries.map((lib) => {
        if (lib.name !== libraryID) return lib;

        const components = lib.components.map((component) => {
          if (component.model.id !== sliceID) return component;
          return {
            ...component,
            mocks,
          };
        });
        return {
          ...lib,
          components,
        };
      });

      return {
        ...state,
        libraries,
      };
    }

    default:
      return state;
  }
};
