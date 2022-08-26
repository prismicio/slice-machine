import { ComponentUI } from "../../lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { pushCustomType, pushSliceApiClient } from "../../src/apiClient";
import { call, fork, put, takeLatest } from "redux-saga/effects";
import { createAction, getType } from "typesafe-actions";
import { withLoader } from "./loading";
import { LoadingKeysEnum } from "./loading/types";
import { pushCustomTypeCreator } from "./selectedCustomType";
import { pushSliceCreator } from "./selectedSlice/actions";
import { openToasterCreator, ToasterType } from "./toaster";
import { modalOpenCreator } from "./modal";
import { ModalKeysEnum } from "./modal/types";
import axios from "axios";

export const changesPushCreator = createAction("PUSH_CHANGES")<{
  unSyncedSlices: ReadonlyArray<ComponentUI>;
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
}>();

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator>) {
  const { unSyncedSlices, unSyncedCustomTypes } = payload;

  for (const slice of unSyncedSlices) {
    try {
      yield call(pushSliceApiClient, slice);
      yield put(pushSliceCreator.success({ component: slice }));
    } catch (e) {
      if (
        axios.isAxiosError(e) &&
        e.response?.status &&
        e.response.status === 403
      ) {
        yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
      } else {
        yield put(
          openToasterCreator({
            message: `Failed to upload slice: ${slice.model.id}`,
            type: ToasterType.ERROR,
          })
        );
      }
      return;
    }
  }

  for (const customType of unSyncedCustomTypes) {
    try {
      yield call(pushCustomType, customType.id);
      yield put(pushCustomTypeCreator.success({ customTypeId: customType.id }));
    } catch (e) {
      if (
        axios.isAxiosError(e) &&
        e.response?.status &&
        e.response.status === 403
      ) {
        yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
      } else {
        yield put(
          openToasterCreator({
            message: `Failed to upload custom type: ${customType.id}`,
            type: ToasterType.ERROR,
          })
        );
      }
      return;
    }
  }

  yield put(
    openToasterCreator({
      message: "All slices and custom types have been pushed",
      type: ToasterType.SUCCESS,
    })
  );
}

function* watchChangesPush() {
  yield takeLatest(
    getType(changesPushCreator),
    withLoader(changesPushSaga, LoadingKeysEnum.CHANGES_PUSH)
  );
}

// Saga Exports
export function* watchChangesPushSagas() {
  yield fork(watchChangesPush);
}
