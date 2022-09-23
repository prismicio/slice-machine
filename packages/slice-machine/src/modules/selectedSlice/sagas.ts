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
import { saveSliceApiClient, renameSlice } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { renameSliceCreator } from "../slices";
import { modalCloseCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { push } from "connected-next-router";

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

export function* renameSliceSaga({
  payload,
}: ReturnType<typeof renameSliceCreator.request>) {
  const { libName, sliceId, newSliceName } = payload;
  try {
    yield call(renameSlice, sliceId, newSliceName, libName);
    yield put(renameSliceCreator.success({ libName, sliceId, newSliceName }));
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

function* watchSaveSlice() {
  yield takeLatest(
    getType(saveSliceCreator.request),
    withLoader(saveSliceSaga, LoadingKeysEnum.SAVE_SLICE)
  );
}
function* watchRenameSlice() {
  yield takeLatest(
    getType(renameSliceCreator.request),
    withLoader(renameSliceSaga, LoadingKeysEnum.RENAME_SLICE)
  );
}

// Saga Exports
export function* selectedSliceSagas() {
  yield fork(watchSaveSlice);
  yield fork(watchRenameSlice);
}
