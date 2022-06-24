import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import {
  call,
  fork,
  put,
  SagaReturnType,
  takeLatest,
} from "redux-saga/effects";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { createSlice, renameSlice } from "@src/apiClient";
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

// Action Creators
export const createSliceCreator = createAsyncAction(
  "SLICES/CREATE.REQUEST",
  "SLICES/CREATE.RESPONSE",
  "SLICES/CREATE.FAILURE"
)<{
  sliceName: string;
  libName: string;
}>();

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
  }
>();

type SlicesActions = ActionType<typeof refreshStateCreator>;

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
  yield put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
  // changing this to use next/router  call(Router.router.push,...) causes bugs in some contexts.
  window.location.href = `/${payload.libName.replace(/\//g, "--")}/${
    payload.sliceName
  }/${variationId}`;
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
    window.location.href = `/${payload.libName.replace(/\//g, "--")}/${
      payload.newSliceName
    }/${payload.variationId}`;
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
