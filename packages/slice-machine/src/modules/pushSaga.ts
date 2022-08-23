import { ComponentUI } from "../../lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { pushCustomType, pushSliceApiClient } from "../../src/apiClient";
import { all, call, fork, put, takeLatest } from "redux-saga/effects";
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

function isAuthError(e: unknown): boolean {
  return axios.isAxiosError(e) &&
    e.response?.status &&
    (e.response.status === 401 || e.response.status === 403)
    ? true
    : false;
}

function* pushSliceSaga(slice: ComponentUI) {
  try {
    yield call(pushSliceApiClient, slice);
    yield put(pushSliceCreator.success({ component: slice }));
    return undefined;
  } catch (e) {
    if (isAuthError(e)) {
      yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
    } else {
      return slice.model.id;
    }
  }
}

function* pushCustomTypeSaga(customType: CustomTypeSM) {
  try {
    yield call(pushCustomType, customType.id);
    yield put(pushCustomTypeCreator.success({ customTypeId: customType.id }));
    return undefined;
  } catch (e) {
    if (isAuthError(e)) {
      yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
    }
    return customType.id;
  }
}

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator>) {
  const { unSyncedSlices, unSyncedCustomTypes } = payload;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const slicesPushResults: Array<string> = yield all(
    unSyncedSlices.map((slice) => call(pushSliceSaga, slice))
  );
  const slicesFailures = slicesPushResults.filter(Boolean).length;

  if (slicesFailures > 0) {
    const errorMsg = `Failed to upload ${slicesFailures} slice${
      slicesFailures > 1 ? "s" : ""
    }`;
    yield put(
      openToasterCreator({
        message: errorMsg,
        type: ToasterType.ERROR,
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customTypePushResults: Array<string> = yield all(
    unSyncedCustomTypes.map((ct) => call(pushCustomTypeSaga, ct))
  );
  const customTypeFailures = customTypePushResults.filter(Boolean).length;

  if (customTypeFailures > 0) {
    const errorMsg = `Failed to upload ${customTypeFailures} custom type${
      customTypeFailures > 1 ? "s" : ""
    }`;
    yield put(
      openToasterCreator({
        message: errorMsg,
        type: ToasterType.ERROR,
      })
    );
  }

  if (slicesFailures === 0 && customTypeFailures === 0) {
    yield put(
      openToasterCreator({
        message: "All slices and custom types have been pushed",
        type: ToasterType.SUCCESS,
      })
    );
  }
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
