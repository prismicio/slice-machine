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
import { saveSlice } from "@src/apiClient";
import { modalCloseCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { push } from "connected-next-router";
import { Reducer } from "redux";
import { SlicesStoreType } from "./types";
import { getStateCreator } from "@src/modules/environment";

// Action Creators
export const createSliceCreator = createAsyncAction(
  "SLICES/CREATE.REQUEST",
  "SLICES/CREATE.RESPONSE",
  "SLICES/CREATE.FAILURE"
)<{
  sliceName: string;
  from: string;
}>();

type SlicesActions = ActionType<typeof getStateCreator>;

// Reducer
export const slicesReducer: Reducer<SlicesStoreType | null, SlicesActions> = (
  state,
  action
) => {
  if (!state) return null;

  switch (action.type) {
    case getType(getStateCreator):
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
    saveSlice,
    payload.sliceName,
    payload.from
  )) as SagaReturnType<typeof saveSlice>;
  yield put(modalCloseCreator({ modalKey: ModalKeysEnum.CREATE_SLICE }));
  yield put(
    push(
      `/${payload.from.replace(/\//g, "--")}/${
        payload.sliceName
      }/${variationId}`
    )
  );
}

// Saga watchers
function* watchCreateSlice() {
  yield takeLatest(
    getType(createSliceCreator.request),
    withLoader(createSliceSaga, LoadingKeysEnum.CREATE_SLICE)
  );
}

// Saga Exports
export function* watchSliceSagas() {
  yield fork(watchCreateSlice);
}
