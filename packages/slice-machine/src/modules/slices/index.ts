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
import { createSlice, getState, renameSlice } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { Reducer } from "redux";
import { SlicesStoreType } from "./types";
import { refreshStateCreator } from "@src/modules/environment";
import { SliceMachineStoreType } from "@src/redux/type";
import { LibraryUI } from "@models/common/LibraryUI";
import { SliceSM } from "@slicemachine/core/build/models";
import Tracker from "../../../src/tracker";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { LOCATION_CHANGE, push } from "connected-next-router";
import {
  generateSliceCustomScreenshotCreator,
  generateSliceScreenshotCreator,
  pushSliceCreator,
  saveSliceCreator,
} from "../selectedSlice/actions";
import { computeStatus, LibStatus } from "@lib/models/common/ComponentUI";
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
    libraries: readonly LibraryUI[];
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
    case getType(renameSliceCreator.success):
      return {
        ...state,
        libraries: action.payload.libraries,
      };
    case getType(saveSliceCreator): {
      const newComponentUI = action.payload.extendedComponent.component;
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
    case getType(pushSliceCreator): {
      const newComponentUI = action.payload.extendedComponent.component;

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
    case getType(generateSliceScreenshotCreator): {
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
    case getType(generateSliceCustomScreenshotCreator): {
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

export function* renameSliceSaga({
  payload,
}: ReturnType<typeof renameSliceCreator.request>) {
  try {
    yield call(
      renameSlice,
      payload.sliceId,
      payload.newSliceName,
      payload.libName
    );
    //TODO: avoid refetch of state. Either manually update all the changes within the reducer,
    //or make the renameSlice api call return the new libraries, so that it's output can be used.
    const { data: serverState } = (yield call(getState)) as SagaReturnType<
      typeof getState
    >;
    yield put(renameSliceCreator.success({ libraries: serverState.libraries }));
    yield put(modalCloseCreator({ modalKey: ModalKeysEnum.RENAME_SLICE }));
    const addr = `/${payload.libName.replace(/\//g, "--")}/${
      payload.newSliceName
    }/${payload.variationId}`;
    yield put(push(addr));
    yield put(
      openToasterCreator({
        message: "Slice name updated",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Slice name not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

// Saga watchers
function* handleSliceRequests() {
  yield takeLatest(
    getType(createSliceCreator.request),
    withLoader(createSliceSaga, LoadingKeysEnum.CREATE_SLICE)
  );
  yield takeLatest(
    getType(renameSliceCreator.request),
    withLoader(renameSliceSaga, LoadingKeysEnum.RENAME_SLICE)
  );
}

// Saga Exports
export function* watchSliceSagas() {
  yield fork(handleSliceRequests);
}
