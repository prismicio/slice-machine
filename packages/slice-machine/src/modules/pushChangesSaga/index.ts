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
import {
  pushCustomTypeCreator,
  pushSliceCreator,
  syncChangeCreator,
} from "./actions";
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
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import Tracker from "@src/tracking/client";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";

const startTimer =
  (startTime = Date.now()) =>
  (endTime = Date.now()) =>
    endTime - startTime;

export const changesPushCreator = createAction("PUSH_CHANGES")<{
  unSyncedSlices: ReadonlyArray<ComponentUI>;
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
  modelStatuses: ModelStatusInformation["modelsStatuses"];
  onChangesPushed: (pushed: string | null) => void;
  handleError: (e: SyncError | null) => void;
}>();

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator>): Generator {
  const {
    unSyncedSlices,
    unSyncedCustomTypes,
    modelStatuses,
    onChangesPushed,
    handleError,
  } = payload;
  const totalNumberOfChanges: number =
    unSyncedSlices.length + unSyncedCustomTypes.length;

  let alreadySyncedChanges = 0;
  let stop: Parameters<typeof handleError>[0] = null;
  let slicesCreated = 0;
  let slicesModified = 0;
  const slicesDeleted = 0;
  let customTypesCreated = 0;
  let customTypesModified = 0;
  const customTypesDeleted = 0;
  let errors = 0;
  const endTimer = startTimer();
  const missingScreenshots: number = unSyncedSlices.reduce(
    (sum: number, slice: ComponentUI) => sum + countMissingScreenshots(slice),
    0
  );

  const sendTracking = () =>
    Tracker.get().trackChangesPushed({
      customTypesCreated,
      customTypesModified,
      customTypesDeleted,
      slicesCreated,
      slicesModified,
      slicesDeleted,
      errors,
      total: totalNumberOfChanges,
      duration: endTimer(),
      missingScreenshots,
    });

  // TODO: remove when transactional push is implemented
  if (
    unSyncedCustomTypes.some((customType) =>
      customType.label?.startsWith("Drawer")
    )
  ) {
    yield put(
      modalOpenCreator({ modalKey: ModalKeysEnum.DELETE_DOCUMENTS_DRAWER })
    );
    yield put(
      modalOpenCreator({
        modalKey: ModalKeysEnum.DELETE_DOCUMENTS_DRAWER_OVER_LIMIT,
      })
    );
  }

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

        // update counters
        const status = modelStatuses.slices[slice.model.id];
        if (status === ModelStatus.New) {
          slicesCreated += 1;
        }
        if (status === ModelStatus.Modified) {
          slicesModified += 1;
        }

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
            errors += 1;
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
  if (stop) {
    void sendTracking();
    return handleError(stop);
  }

  // Pushing Custom Types
  yield all(
    unSyncedCustomTypes.map(function* (customType) {
      try {
        // calling the API to push the Custom type
        yield call(pushCustomType, customType.id);

        // update counters
        const status = modelStatuses.customTypes[customType.id];
        if (status === ModelStatus.New) {
          customTypesCreated += 1;
        }
        if (status === ModelStatus.Modified) {
          customTypesModified += 1;
        }

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
            errors += 1;
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

  // send tracking
  void sendTracking();

  // Stop the saga if there was an error
  if (stop) return handleError(stop);

  // close the custom toaster
  yield closeSyncToaster();

  // Send global success event
  yield put(syncChangeCreator());

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
