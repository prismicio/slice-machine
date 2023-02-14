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
import { openToasterCreator, ToasterType } from "../toaster";
import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { LoadingKeysEnum } from "../loading/types";
import { refreshStateCreator } from "../environment";
import {
  InvalidCustomTypeResponse,
  PushChangesPayload,
} from "@lib/models/common/TransactionalPush";
import {
  Limit,
  LimitType,
} from "@slicemachine/client/build/models/BulkChanges";
import axios from "axios";

export const changesPushCreator = createAsyncAction(
  "PUSH_CHANGES.REQUEST",
  "PUSH_CHANGES.RESPONSE",
  "PUSH_CHANGES.FAILURE"
)<PushChangesPayload, undefined, Limit | InvalidCustomTypeResponse>();

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
  try {
    const response = (yield call(pushChanges, {
      confirmDeleteDocuments: payload.confirmDeleteDocuments,
    })) as SagaReturnType<typeof pushChanges>;

    const modalKey = {
      INVALID_CUSTOM_TYPES: ModalKeysEnum.REFERENCES_MISSING_DRAWER,
      [LimitType.SOFT]: ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER,
      [LimitType.HARD]: ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER,
    };

    if (response.data) {
      yield put(
        changesPushCreator.failure(
          response.data.type === "INVALID_CUSTOM_TYPES"
            ? response.data
            : sortDocumentLimits(response.data)
        )
      );
      yield put(
        modalOpenCreator({
          modalKey: modalKey[response.data.type],
        })
      );
      return;
    }

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
    yield put(changesPushCreator.success());

    // Display success toaster
    yield put(
      openToasterCreator({
        content: "All slices and custom types have been pushed",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (error) {
    const errorStatus =
      axios.isAxiosError(error) && error.response ? error.response.status : 500;
    switch (errorStatus) {
      case 401:
      case 403: {
        // Opening the login modal
        yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));

        break;
      }

      default: {
        yield put(
          openToasterCreator({
            content:
              "Something went wrong when pushing your changes. Check your terminal logs.",
            type: ToasterType.ERROR,
          })
        );
      }
    }
  }
}

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
export type PushChangesStoreType = Readonly<
  Limit | InvalidCustomTypeResponse | null
>;
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
