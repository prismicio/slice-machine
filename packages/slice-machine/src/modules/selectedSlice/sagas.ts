import {
  call,
  fork,
  takeLatest,
  put,
  SagaReturnType,
  select,
} from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";
import { saveSliceCreator } from "./actions";
import { saveSliceApiClient, renameSlice } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { renameSliceCreator, renameSliceModel } from "../slices";
import { modalCloseCreator } from "../modal";
import { push } from "connected-next-router";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectSliceById } from "./selectors";

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
    const slice = (yield select((store: SliceMachineStoreType) =>
      selectSliceById(store, libName, sliceId)
    )) as ReturnType<typeof selectSliceById>;
    if (!slice) {
      throw new Error(
        `Slice "${payload.sliceId} in the "${payload.libName}" library not found.`
      );
    }

    const renamedSlice = renameSliceModel({
      slice: slice.model,
      newName: newSliceName,
    });

    yield call(renameSlice, renamedSlice, libName);
    yield put(renameSliceCreator.success({ libName, renamedSlice }));
    yield put(modalCloseCreator());
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
    console.error(e);
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
