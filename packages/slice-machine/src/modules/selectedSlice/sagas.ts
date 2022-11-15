import {
  call,
  fork,
  takeLatest,
  put,
  SagaReturnType,
} from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";
import { saveSliceCreator } from "./actions";
import { saveSliceApiClient } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";

export function* saveSliceSaga({
  payload,
}: ReturnType<typeof saveSliceCreator.request>) {
  const { component, setData } = payload;

  try {
    setData({
      loading: true,
      done: false,
      error: null,
      status: null,
      message: null,
    });
    const response = (yield call(
      saveSliceApiClient,
      component
    )) as SagaReturnType<typeof saveSliceApiClient>;
    if (response.status > 209) {
      return setData({
        loading: false,
        done: true,
        error: response.data.err,
        status: response.status,
        message: response.data.reason,
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      warning: !!response.data.warning,
      status: response.status,
      message:
        response.data.warning ||
        "Models & mocks have been generated successfully!",
    });

    yield put(saveSliceCreator.success({ component }));
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Models & mocks not generated",
        type: ToasterType.ERROR,
      })
    );
  }
}

function* watchSaveSlice() {
  yield takeLatest(
    getType(saveSliceCreator.request),
    withLoader(saveSliceSaga, LoadingKeysEnum.SAVE_SLICE)
  );
}

// Saga Exports
export function* selectedSliceSagas() {
  yield fork(watchSaveSlice);
}
