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
    const { errors } = (yield call(
      saveSliceApiClient,
      component
    )) as SagaReturnType<typeof saveSliceApiClient>;
    if (errors.length > 0) {
      return setData({
        loading: false,
        done: true,
        error: errors,
        message: errors[0].message,
        status: 500,
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      message: "Model saved",
    });

    yield put(saveSliceCreator.success({ component }));
  } catch (e) {
    yield put(
      openToasterCreator({
        content: "Internal Error: Models & mocks not generated",
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
