import { put } from "redux-saga/effects";
import {
  closeToasterCreator,
  openToasterCreator,
  ToasterType,
  updateToasterCreator,
} from "../toaster";

export const PUSH_CHANGES_TOASTER_ID = "push-changes-toaster";
export const syncChangesToasterMessage = (
  alreadySyncedChanges: number,
  totalNumberOfChanges: number
) =>
  `Pushing Changes (${
    alreadySyncedChanges + 1
  } out of ${totalNumberOfChanges})`;

export function openSyncToaster(
  alreadySyncedChanges: number,
  totalNumberOfChanges: number
) {
  return put(
    openToasterCreator({
      message: syncChangesToasterMessage(
        alreadySyncedChanges,
        totalNumberOfChanges
      ),
      type: ToasterType.LOADING,
      options: {
        autoClose: false,
        toastId: PUSH_CHANGES_TOASTER_ID,
      },
    })
  );
}

export function updateSyncToaster(
  alreadySyncedChanges: number,
  totalNumberOfChanges: number
) {
  return put(
    updateToasterCreator({
      toasterId: PUSH_CHANGES_TOASTER_ID,
      options: {
        render: syncChangesToasterMessage(
          alreadySyncedChanges,
          totalNumberOfChanges
        ),
      },
    })
  );
}

export function closeSyncToaster() {
  return put(
    closeToasterCreator({
      toasterId: PUSH_CHANGES_TOASTER_ID,
    })
  );
}
