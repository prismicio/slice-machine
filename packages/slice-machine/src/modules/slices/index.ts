import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import {
  call,
  fork,
  put,
  SagaReturnType,
  take,
  takeLatest,
} from "redux-saga/effects";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { createSlice, getState } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { Reducer } from "redux";
import { SlicesStoreType } from "./types";
import { refreshStateCreator } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { LibraryUI } from "@models/common/LibraryUI";
import { SliceSM } from "@slicemachine/core/build/models";
import Tracker from "../../tracking/client";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { LOCATION_CHANGE, push } from "connected-next-router";
import { saveSliceCreator } from "../selectedSlice/actions";
import { pushSliceCreator } from "../pushChangesSaga/actions";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
} from "../screenshots/actions";
import { ComponentUI, ScreenshotUI } from "@lib/models/common/ComponentUI";
import { FrontEndSliceModel } from "@lib/models/common/ModelStatus/compareSliceModels";

// Action Creators
export const createSliceCreator = createAsyncAction(
  "SLICES/CREATE.REQUEST",
  "SLICES/CREATE.RESPONSE",
  "SLICES/CREATE.FAILURE"
)<
  {
    sliceName: string;
    libName: string;
  },
  {
    libraries: readonly LibraryUI[];
  }
>();

export const renameSliceCreator = createAsyncAction(
  "SLICES/RENAME.REQUEST",
  "SLICES/RENAME.RESPONSE",
  "SLICES/RENAME.FAILURE"
)<
  {
    libName: string;
    sliceId: string;
    variationId: string;
    newSliceName: string;
  },
  {
    libName: string;
    sliceId: string;
    newSliceName: string;
  }
>();

type SlicesActions =
  | ActionType<typeof refreshStateCreator>
  | ActionType<typeof createSliceCreator>
  | ActionType<typeof renameSliceCreator>
  | ActionType<typeof saveSliceCreator>
  | ActionType<typeof pushSliceCreator>
  | ActionType<typeof generateSliceScreenshotCreator>
  | ActionType<typeof generateSliceCustomScreenshotCreator>;

// Selectors
export const getLibraries = (
  store: SliceMachineStoreType
): ReadonlyArray<LibraryUI> => store.slices.libraries;

export const getRemoteSlice = (
  store: SliceMachineStoreType,
  componentId: string
): SliceSM | undefined => {
  return store.slices.remoteSlices.find((rs) => rs.id === componentId);
};

export const getRemoteSlices = (
  store: SliceMachineStoreType
): ReadonlyArray<SliceSM> => store.slices.remoteSlices;

export const getFrontendSlices = (
  store: SliceMachineStoreType
): FrontEndSliceModel[] => {
  const components: ComponentUI[] = store.slices.libraries.reduce(
    (acc: ComponentUI[], lib: LibraryUI) => {
      return [...acc, ...lib.components];
    },
    []
  );

  return components.reduce(
    (acc: FrontEndSliceModel[], component: ComponentUI) => {
      return [
        ...acc,
        {
          local: component.model,
          remote: getRemoteSlice(store, component.model.id),
          localScreenshots: component.screenshots,
        },
      ];
    },
    []
  );
};

// Reducer
export const slicesReducer: Reducer<SlicesStoreType | null, SlicesActions> = (
  state,
  action
) => {
  if (!state) return null;

  switch (action.type) {
    case getType(refreshStateCreator):
      return {
        ...state,
        libraries: action.payload.libraries,
        remoteSlices: action.payload.remoteSlices,
      };
    case getType(createSliceCreator.success):
      return {
        ...state,
        libraries: action.payload.libraries,
      };
    case getType(renameSliceCreator.success): {
      const { libName, sliceId, newSliceName } = action.payload;
      const newLibs = state.libraries.map((library) => {
        if (library.name !== libName) return library;
        return {
          ...library,
          components: library.components.map((component) => {
            if (component.model.id !== sliceId) return component;
            return renamedComponentUI(component, newSliceName);
          }),
        };
      });
      return {
        ...state,
        libraries: newLibs,
      };
    }
    case getType(saveSliceCreator.success): {
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
    case getType(pushSliceCreator.success): {
      const { component, updatedScreenshotsUrls } = action.payload;

      const remoteSlice = state.remoteSlices.find(
        (slice) => slice.id === component.model.id
      );

      const updateScreenshots = (remoteSlice: SliceSM): SliceSM => {
        return {
          ...remoteSlice,
          variations: remoteSlice.variations.map((variation) => ({
            ...variation,
            imageUrl: updatedScreenshotsUrls[variation.id] || undefined,
          })),
        };
      };

      const updatedRemoteSlices = remoteSlice
        ? state.remoteSlices.map((remoteSlice) => {
            // modified
            if (remoteSlice.id !== component.model.id) return remoteSlice;
            return updateScreenshots(component.model);
          })
        : [...state.remoteSlices, updateScreenshots(component.model)]; // new

      return {
        ...state,
        remoteSlices: updatedRemoteSlices,
      };
    }
    case getType(generateSliceScreenshotCreator.success):
    case getType(generateSliceCustomScreenshotCreator.success): {
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
                    ...(screenshot
                      ? {
                          [variationId]: screenshot,
                        }
                      : {}),
                  },
                }
              : c
          ),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    default:
      return state;
  }
};

// Sagas
export function* createSliceSaga({
  payload,
}: ReturnType<typeof createSliceCreator.request>) {
  const { variationId } = (yield call(
    createSlice,
    payload.sliceName,
    payload.libName
  )) as SagaReturnType<typeof createSlice>;
  void Tracker.get().trackCreateSlice({
    id: payload.sliceName,
    name: payload.sliceName,
    library: payload.libName,
  });
  const serverState = (yield call(getState)) as SagaReturnType<typeof getState>;
  yield put(createSliceCreator.success({ libraries: serverState.libraries }));
  yield put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
  const addr = `/${payload.libName.replace(/\//g, "--")}/${
    payload.sliceName
  }/${variationId}`;
  yield put(push("/[lib]/[sliceName]/[variation]", addr));
  yield take(LOCATION_CHANGE);
  yield put(
    openToasterCreator({
      message: "Slice saved",
      type: ToasterType.SUCCESS,
    })
  );
}

// Saga watchers
function* handleSliceRequests() {
  yield takeLatest(
    getType(createSliceCreator.request),
    withLoader(createSliceSaga, LoadingKeysEnum.CREATE_SLICE)
  );
}

// Saga Exports
export function* watchSliceSagas() {
  yield fork(handleSliceRequests);
}

export const renamedComponentUI = (
  initialComponent: ComponentUI,
  newName: string
): ComponentUI => {
  const { model, screenshots } = initialComponent;
  return {
    ...initialComponent,
    model: renameModel(model, newName),
    screenshots: renameScreenshots(screenshots, model.name, newName),
  };
};

export const renameScreenshots = (
  initialScreenshots: Record<string, ScreenshotUI>,
  prevName: string,
  newName: string
): Record<string, ScreenshotUI> => {
  return Object.entries(initialScreenshots).reduce((acc, [key, screenshot]) => {
    acc[key] = {
      ...screenshot,
      url: screenshot.url.replace(prevName, newName),
      path: screenshot.path.replace(prevName, newName),
    };
    return acc;
  }, {} as Record<string, ScreenshotUI>);
};

export const renameModel = (
  initialModel: SliceSM,
  newName: string
): SliceSM => {
  return { ...initialModel, name: newName };
};
