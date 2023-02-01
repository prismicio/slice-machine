import { getState, pushChanges } from "../../apiClient";
import {
  call,
  fork,
  put,
  SagaReturnType,
  takeLatest,
} from "redux-saga/effects";
import {
  ActionType,
  createAsyncAction,
  getType,
  Reducer,
} from "typesafe-actions";
import { withLoader } from "../loading";
import { syncChangeCreator } from "./actions";
import { openToasterCreator, ToasterType } from "../toaster";
import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { LoadingKeysEnum } from "../loading/types";
import { refreshStateCreator } from "../environment";
import { Limit, LimitType } from "@slicemachine/client/build/models";
import { PushChangesPayload } from "@lib/models/common/TransactionalPush";

export const changesPushCreator = createAsyncAction(
  "PUSH_CHANGES.REQUEST",
  "PUSH_CHANGES.RESPONSE",
  "PUSH_CHANGES.FAILURE"
)<PushChangesPayload, undefined, Limit>();

const sortDocumentLimits = (limit: Readonly<Limit>) => ({
  ...limit,
  details: {
    ...limit.details,
    customTypes: [...limit.details.customTypes].sort(
      (doc1, doc2) => doc2.numberOfDocuments - doc1.numberOfDocuments
    ),
  },
});

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator.request>): Generator {
  const response = (yield call(pushChanges, payload)) as SagaReturnType<
    typeof pushChanges
  >;

  if (response.data?.type) {
    yield put(changesPushCreator.failure(sortDocumentLimits(response.data)));
    yield put(
      modalOpenCreator({
        modalKey:
          response.data?.type === LimitType.SOFT
            ? ModalKeysEnum.DELETE_DOCUMENTS_DRAWER
            : ModalKeysEnum.DELETE_DOCUMENTS_DRAWER_OVER_LIMIT,
      })
    );
    return;
  }

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
    getType(changesPushCreator.request),
    withLoader(changesPushSaga, LoadingKeysEnum.CHANGES_PUSH)
  );
}

// Saga Exports
export function* watchChangesPushSagas() {
  yield fork(watchChangesPush);
}

// Reducer
export type PushChangesStoreType = Readonly<Limit | null>;
type PushChangesActions = ActionType<typeof changesPushCreator>;

export const pushChangesReducer: Reducer<
  PushChangesStoreType,
  PushChangesActions
> = (state = null, action) => {
  switch (action.type) {
    case getType(changesPushCreator.request):
    case getType(changesPushCreator.success):
      return null;

    case getType(changesPushCreator.failure): {
      return action.payload;
    }
    default:
      return state;
  }
};
