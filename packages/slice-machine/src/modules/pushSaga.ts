import { ComponentUI } from "../../lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import {
  getState,
  pushCustomType,
  pushSliceApiClient,
} from "../../src/apiClient";
import {
  all,
  call,
  fork,
  put,
  SagaReturnType,
  takeLatest,
} from "redux-saga/effects";
import { createAction, getType } from "typesafe-actions";
import { withLoader } from "./loading";
import { LoadingKeysEnum } from "./loading/types";
import { pushCustomTypeCreator } from "./selectedCustomType";
import { pushSliceCreator } from "./selectedSlice/actions";
import { openToasterCreator, ToasterType } from "./toaster";
import { modalOpenCreator } from "./modal";
import { ModalKeysEnum } from "./modal/types";
import axios from "axios";
import { refreshStateCreator } from "./environment";

export const changesPushCreator = createAction("PUSH_CHANGES")<{
  unSyncedSlices: ReadonlyArray<ComponentUI>;
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
}>();

function* pushSliceSaga(slice: ComponentUI) {
  try {
    yield call(pushSliceApiClient, slice);
    yield put(pushSliceCreator.success({ component: slice }));
    return undefined;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status) {
      return e.response.status;
    }
    return slice.model.id;
  }
}

function* pushCustomTypeSaga(customType: CustomTypeSM) {
  try {
    yield call(pushCustomType, customType.id);
    yield put(pushCustomTypeCreator.success({ customTypeId: customType.id }));
    return undefined;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status) {
      return e.response.status;
    }
    return customType.id;
  }
}

function isTruthyString(str: unknown): str is string {
  return typeof str === typeof "" && Boolean(str);
}

function isAuthErrorCode(n: unknown): n is number {
  return typeof n === typeof 0 && (n === 401 || n === 403);
}

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator>) {
  const { unSyncedSlices, unSyncedCustomTypes } = payload;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const slicesPushResults: Array<string | undefined | number> = yield all(
    unSyncedSlices.map((slice) => call(pushSliceSaga, slice))
  );

  const sliceAuthFailures = slicesPushResults.filter(isAuthErrorCode).length;
  const slicesFailures = slicesPushResults.filter(isTruthyString).length;

  if (sliceAuthFailures > 0) {
    yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  } else if (slicesFailures > 0) {
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
  const customTypePushResults: Array<string | undefined | number> = yield all(
    unSyncedCustomTypes.map((ct) => call(pushCustomTypeSaga, ct))
  );

  const customTypeAuthFailures =
    customTypePushResults.filter(isAuthErrorCode).length;
  const customTypeFailures =
    customTypePushResults.filter(isTruthyString).length;

  if (customTypeAuthFailures > 0) {
    yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
  } else if (customTypeFailures > 0) {
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

  if (
    sliceAuthFailures +
      slicesFailures +
      customTypeFailures +
      customTypeAuthFailures ===
    0
  ) {
    yield put(
      openToasterCreator({
        message: "All slices and custom types have been pushed",
        type: ToasterType.SUCCESS,
      })
    );
  }

  const { data: serverState } = (yield call(getState)) as SagaReturnType<
    typeof getState
  >;
  const { customTypes, ...rest } = serverState;
  yield put(refreshStateCreator({ ...rest, localCustomTypes: customTypes }));
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
