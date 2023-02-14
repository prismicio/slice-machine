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
import { PushChangesPayload } from "@lib/models/common/TransactionalPush";
import {
  Limit,
  LimitType,
} from "@slicemachine/client/build/models/BulkChanges";
import axios from "axios";
import Tracker from "@src/tracking/client";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { trackPushChangesSuccess } from "./trackPushChangesSuccess";

export type ChangesPushSagaPayload = PushChangesPayload & {
  unSyncedSlices: ReadonlyArray<ComponentUI>;
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
  modelsStatuses: ModelStatusInformation["modelsStatuses"];
};

export const changesPushCreator = createAsyncAction(
  "PUSH_CHANGES.REQUEST",
  "PUSH_CHANGES.RESPONSE",
  "PUSH_CHANGES.FAILURE"
)<ChangesPushSagaPayload, undefined, Limit>();

export const sortDocumentLimits = (limit: Readonly<Limit>) => ({
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
  const startTime = Date.now();

  try {
    const response = (yield call(pushChanges, {
      confirmDeleteDocuments: payload.confirmDeleteDocuments,
    })) as SagaReturnType<typeof pushChanges>;

    if (response.data && response.data.type) {
      yield put(changesPushCreator.failure(sortDocumentLimits(response.data)));
      void Tracker.get().trackChangesLimitReach({
        limitType: response.data.type,
      });
      yield put(
        modalOpenCreator({
          modalKey:
            response.data?.type === LimitType.SOFT
              ? ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER
              : ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER,
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

    // Tracking the success of the push
    void trackPushChangesSuccess({ ...payload, startTime });

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
