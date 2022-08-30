import { ComponentUI } from "../../lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { pushCustomType, pushSliceApiClient } from "../apiClient";
import {
  all,
  call,
  cancel,
  cancelled,
  fork,
  put,
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

export const changesPushCreator = createAction("PUSH_CHANGES")<{
  unSyncedSlices: ReadonlyArray<ComponentUI>;
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
}>();

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator>): Generator {
  const { unSyncedSlices, unSyncedCustomTypes } = payload;

  yield all(
    unSyncedSlices.map(function* (slice) {
      try {
        // should we add pushSliceCreator.request ?
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
          yield put(pushSliceCreator.failure({ component: slice })); // TODO: update the status to errored.
        }
        yield cancel();
      }
    })
  );

  if (yield cancelled()) return; // maybe add some message here ?

  yield all(
    unSyncedCustomTypes.map(function* (customType) {
      try {
        yield call(pushCustomType, customType.id);
        yield put(
          pushCustomTypeCreator.success({ customTypeId: customType.id })
        );
      } catch (e) {
        if (
          axios.isAxiosError(e) &&
          e.response?.status &&
          e.response.status === 403
        ) {
          yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
        } else {
          yield put(
            pushCustomTypeCreator.failure({ customTypeId: customType.id })
          ); // TODO: update the custom type status to errored
        }
        yield cancel();
      }
    })
  );

  if (yield cancelled()) return; // maybe add some message here ?

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
