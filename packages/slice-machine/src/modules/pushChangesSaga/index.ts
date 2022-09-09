import { ComponentUI } from "../../../lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { pushCustomType, pushSliceApiClient } from "../../apiClient";
import {
  all,
  call,
  cancel,
  delay,
  fork,
  put,
  takeLatest,
} from "redux-saga/effects";
import { createAction, getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { pushCustomTypeCreator, pushSliceCreator } from "./actions";
import { openToasterCreator, ToasterType } from "../toaster";
import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import axios from "axios";
import {
  closeSyncToaster,
  openSyncToaster,
  updateSyncToaster,
} from "./syncToaster";
import { LoadingKeysEnum } from "../loading/types";
import { ApiError } from "@src/models/ApiError";
import { SyncError } from "@src/models/SyncError";

export const changesPushCreator = createAction("PUSH_CHANGES")<{
  unSyncedSlices: ReadonlyArray<ComponentUI>;
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
  onChangesPushed: (pushed: string | null) => void;
  handleError: (e: SyncError | null) => void;
}>();

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator>): Generator {
  const { unSyncedSlices, unSyncedCustomTypes, onChangesPushed, handleError } =
    payload;
  const totalNumberOfChanges: number =
    unSyncedSlices.length + unSyncedCustomTypes.length;

  let alreadySyncedChanges = 0;
  let stop: Parameters<typeof handleError>[0] = null;

  // Open the custom toaster
  yield openSyncToaster(alreadySyncedChanges, totalNumberOfChanges);

  // Pushing Slices
  yield all(
    unSyncedSlices.map(function* (
      slice
    ): Generator<unknown, void, Record<string, string | null>> {
      try {
        // calling the API to push the Slice
        const updatedScreenshots = yield call(pushSliceApiClient, slice);

        // trigger fade out animation
        yield onChangesPushed(slice.model.id);

        // wait for animation to finish
        yield delay(300);

        // Updating the Redux stores
        yield put(
          pushSliceCreator.success({
            component: slice,
            updatedScreenshotsUrls: updatedScreenshots,
          })
        );

        // updating the custom toaster
        alreadySyncedChanges++;
        yield updateSyncToaster(alreadySyncedChanges, totalNumberOfChanges);
      } catch (e) {
        // close the custom toaster
        yield closeSyncToaster();

        // Sending failure event
        yield put(pushSliceCreator.failure({ component: slice }));

        const errorStatus =
          axios.isAxiosError(e) && e.response ? e.response.status : 500;

        switch (errorStatus) {
          case 400: {
            stop = { type: "slice", error: ApiError.INVALID_MODEL };
            break;
          }

          case 401:
          case 403: {
            // Opening the login modal
            yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));

            // Canceling the saga
            yield cancel();

            break;
          }

          default: {
            // Display error toaster
            yield displayGeneralError();

            // Cancel the saga as it's an unexpected error
            yield cancel();
          }
        }
      }
    })
  );

  // Stop the saga if there was an error
  if (stop) return handleError(stop);

  // Pushing Custom Types
  yield all(
    unSyncedCustomTypes.map(function* (customType) {
      try {
        // calling the API to push the Custom type
        yield call(pushCustomType, customType.id);

        // Updating the Redux stores
        yield put(
          pushCustomTypeCreator.success({ customTypeId: customType.id })
        );

        // updating the custom toaster
        alreadySyncedChanges++;
        yield updateSyncToaster(alreadySyncedChanges, totalNumberOfChanges);
      } catch (e) {
        // close the custom toaster
        yield closeSyncToaster();

        // Sending failure event
        yield put(
          pushCustomTypeCreator.failure({ customTypeId: customType.id })
        );

        const errorStatus =
          axios.isAxiosError(e) && e.response ? e.response.status : 500;

        switch (errorStatus) {
          case 400: {
            stop = { type: "custom type", error: ApiError.INVALID_MODEL };
            break;
          }

          case 401:
          case 403: {
            // Opening the login modal
            yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));

            // Canceling the saga
            yield cancel();

            break;
          }

          default: {
            // Display error toaster
            yield displayGeneralError();

            // Cancel the saga as it's an unexpected error
            yield cancel();
          }
        }
      }
    })
  );

  // Stop the saga if there was an error
  if (stop) return handleError(stop);

  // close the custom toaster
  yield closeSyncToaster();

  // Display success toaster
  yield put(
    openToasterCreator({
      message: "All slices and custom types have been pushed",
      type: ToasterType.SUCCESS,
    })
  );
}

function displayGeneralError() {
  return put(
    openToasterCreator({
      message:
        "An unexpected error happened while contacting the Prismic API, please try again or contact us.",
      type: ToasterType.ERROR,
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
