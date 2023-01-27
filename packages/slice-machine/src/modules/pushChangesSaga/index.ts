import { pushChanges } from "../../apiClient";
import { call, fork, put, takeLatest } from "redux-saga/effects";
import { createAction, getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { syncChangeCreator } from "./actions";
import { openToasterCreator, ToasterType } from "../toaster";
import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { LoadingKeysEnum } from "../loading/types";

export const changesPushCreator = createAction("PUSH_CHANGES")();

export function* changesPushSaga(): Generator {
  yield call(pushChanges);

  // TODO: remove when transactional push is implemented
  yield put(
    modalOpenCreator({ modalKey: ModalKeysEnum.DELETE_DOCUMENTS_DRAWER }) // Soft limit
  );
  yield put(
    modalOpenCreator({
      modalKey: ModalKeysEnum.DELETE_DOCUMENTS_DRAWER_OVER_LIMIT, // Hard limit
    })
  );

  // TODO: TRACKING SHOULD BE DONE ON THE BACKEND SIDE NOW AS THE BACKEND REALLY KNOWS WHAT HAPPENS
  // send tracking
  // void sendTracking();

  // Send global success event
  yield put(syncChangeCreator());

  // Display success toaster
  yield put(
    openToasterCreator({
      content: "All slices and custom types have been pushed",
      type: ToasterType.SUCCESS,
    })
  );
}

/*function displayGeneralError() {
  return put(
    openToasterCreator({
      content:
        "An unexpected error happened while contacting the Prismic API, please try again or contact us.",
      type: ToasterType.ERROR,
    })
  );
}*/

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
