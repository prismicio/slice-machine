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
import LibraryState from "@lib/models/ui/LibraryState";
import { useModelReducer } from "@src/models/slice/context";
import { SliceMockConfig } from "@lib/models/common/MockConfig";
import { LOCATION_CHANGE, push } from "connected-next-router";

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
  | ActionType<typeof renameSliceCreator>;

// Selectors
export const getLibraries = (
  store: SliceMachineStoreType
): ReadonlyArray<LibraryUI> => store.slices.libraries;

export const getLibrariesState = (
  store: SliceMachineStoreType
): ReadonlyArray<LibraryState> | null => {
  if (!store.slices.libraries) {
    return null;
  }
  return store.slices.libraries.map((lib) => {
    return {
      name: lib.name,
      isLocal: lib.isLocal,
      components: lib.components.map((component) =>
        useModelReducer({
          slice: component,
          mockConfig: SliceMockConfig.getSliceMockConfig(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            store.environment.mockConfig,
            lib.name,
            component.model.name
          ),
          remoteSlice: store.slices.remoteSlices?.find(
            (e) => e.id === component.model.id
          ),
        })
      ),
    };
  });
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
    case getType(renameSliceCreator.success):
      return {
        ...state,
        libraries: action.payload.libraries,
      };
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
