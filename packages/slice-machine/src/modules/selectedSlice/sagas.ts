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
import { updateSliceCreator } from "./actions";
import { readSliceMocks, updateSliceApiClient } from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { SliceToastMessage } from "@components/ToasterContainer";

export function* updateSliceSaga({
  payload,
}: ReturnType<typeof updateSliceCreator.request>) {
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
      updateSliceApiClient,
      component
    )) as SagaReturnType<typeof updateSliceApiClient>;
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
      message: SliceToastMessage({
        path: `${component.from}/${component.model.name}/model.json`,
      }),
    });

    const { mocks } = (yield call(readSliceMocks, {
      libraryID: component.from,
      sliceID: component.model.id,
    })) as SagaReturnType<typeof readSliceMocks>;

    yield put(
      updateSliceCreator.success({ component: { ...component, mocks } })
    );
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
    getType(updateSliceCreator.request),
    withLoader(updateSliceSaga, LoadingKeysEnum.SAVE_SLICE)
  );
}

// Saga Exports
export function* selectedSliceSagas() {
  yield fork(watchSaveSlice);
}
