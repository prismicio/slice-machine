import { getState, pushChanges } from "../../apiClient";
import {
  call,
  fork,
  put,
  SagaReturnType,
  takeLatest,
} from "redux-saga/effects";
import { createAction, getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { syncChangeCreator } from "./actions";
import { openToasterCreator, ToasterType } from "../toaster";
import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { LoadingKeysEnum } from "../loading/types";
import { refreshStateCreator } from "../environment";

export const changesPushCreator = createAction("PUSH_CHANGES")();

export function* changesPushSaga(): Generator {
  yield call(pushChanges);

  // TODO: find a better way of doing this
  const { data: serverState } = (yield call(getState)) as SagaReturnType<
    typeof getState
  >;
  yield put(
    refreshStateCreator({
      env: serverState.env,
      remoteCustomTypes: serverState.remoteCustomTypes,
      localCustomTypes: serverState.customTypes,
      libraries: serverState.libraries,
      remoteSlices: serverState.remoteSlices,
      clientError: serverState.clientError,
    })
  );

  // yield put(
  //   modalOpenCreator({ modalKey: ModalKeysEnum.DELETE_DOCUMENTS_DRAWER }) // Soft limit
  // );
  // yield put(
  //   modalOpenCreator({
  //     modalKey: ModalKeysEnum.DELETE_DOCUMENTS_DRAWER_OVER_LIMIT, // Hard limit
  //   })
  // );

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
