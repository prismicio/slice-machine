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
import { Screenshot, SliceSM } from "@slicemachine/core/build/models";
import Tracker from "../../tracking/client";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { LOCATION_CHANGE, push } from "connected-next-router";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
  pushSliceCreator,
  saveSliceCreator,
} from "../selectedSlice/actions";
import {
  ComponentUI,
  computeStatus,
  LibStatus,
} from "@lib/models/common/ComponentUI";
import { Screenshots } from "@lib/models/common/Screenshots";

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
    sliceId: string;
    newSliceName: string;
    libName: string;
    variationId: string;
  },
  {
    sliceId: string;
    newSliceName: string;
    libName: string;
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
      const __status = computeStatus(newComponentUI, state.remoteSlices);

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== newComponentUI.from) return library;
        return {
          ...library,
          components: library.components.map((component) => {
            return component.model.id !== newComponentUI.model.id
              ? component
              : { ...newComponentUI, __status };
          }),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    case getType(pushSliceCreator.success): {
      const newComponentUI = action.payload.component;

      const newRemoteSlices = [...state.remoteSlices];

      const remoteSliceIndex = state.remoteSlices.findIndex(
        ({ id }) => id === newComponentUI.model.id
      );

      if (remoteSliceIndex !== -1) {
        newRemoteSlices[remoteSliceIndex] = newComponentUI.model;
      } else {
        newRemoteSlices.push(newComponentUI.model);
      }

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== newComponentUI.from) return library;
        return {
          ...library,
          components: library.components.map((component) => {
            return component.model.id !== newComponentUI.model.id
              ? component
              : { ...newComponentUI, __status: LibStatus.Synced };
          }),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    case getType(generateSliceScreenshotCreator.success): {
      const { screenshots: screenshotUrls, component } = action.payload;

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== component.from) return library;
        return {
          ...library,
          components: library.components.map((c) => {
            return component.model.id !== c.model.id
              ? c
              : { ...c, screenshotUrls, __status: LibStatus.Modified };
          }),
        };
      });

      return { ...state, libraries: newLibraries };
    }
    case getType(generateSliceCustomScreenshotCreator.success): {
      const { variationId, screenshot, component } = action.payload;

      const screenshotUrls: Screenshots = component.model.variations.reduce(
        (acc, variation) => {
          if (variation.id === variationId) {
            return {
              ...acc,
              [variationId]: screenshot,
            };
          }
          if (component.screenshotUrls?.[variation.id]) {
            return {
              ...acc,
              [variation.id]: component.screenshotUrls[variation.id],
            };
          }
          return acc;
        },
        {}
      );

      const newLibraries = state.libraries.map((library) => {
        if (library.name !== component.from) return library;
        return {
          ...library,
          components: library.components.map((c) => {
            return component.model.id !== c.model.id
              ? c
              : { ...c, screenshotUrls, __status: LibStatus.Modified };
          }),
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
  const { data: serverState } = (yield call(getState)) as SagaReturnType<
    typeof getState
  >;
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
  const { model, screenshotPaths, screenshotUrls } = initialComponent;
  return {
    ...initialComponent,
    model: renameModel(model, newName),
    screenshotPaths: renameScreenshotPaths(
      screenshotPaths,
      model.name,
      newName
    ),
    screenshotUrls: renameScreenshotUrls(
      screenshotUrls || {},
      model.name,
      newName
    ),
  };
};

export const renameScreenshotPaths = (
  initialPaths: Record<string, Screenshot>,
  prevName: string,
  newName: string
): Record<string, Screenshot> => {
  return Object.entries(initialPaths).reduce((acc, [key, screenshot]) => {
    acc[key] = { path: screenshot.path.replace(prevName, newName) };
    return acc;
  }, {} as Record<string, Screenshot>);
};

export const renameScreenshotUrls = (
  initialPaths: Screenshots | undefined,
  prevName: string,
  newName: string
): Screenshots => {
  if (!initialPaths) return {};
  return Object.entries(initialPaths).reduce((acc, [key, screenshot]) => {
    acc[key] = {
      path: screenshot.path.replace(prevName, newName),
      url: screenshot.url.replace(prevName, newName),
    };
    return acc;
  }, {} as Screenshots);
};

export const renameModel = (
  initialModel: SliceSM,
  newName: string
): SliceSM => {
  return { ...initialModel, name: newName };
};
