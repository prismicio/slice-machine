import { getState, pushChanges, telemetry } from "../../apiClient";
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
import { trackPushChangesSuccess } from "./trackPushChangesSuccess";
import {
  isUnauthenticatedError,
  isUnauthorizedError,
  SliceMachineManagerClient,
} from "@slicemachine/manager/client";
import {
  ChangedCustomType,
  ChangedSlice,
} from "@lib/models/common/ModelStatus";

export type ChangesPushSagaPayload = PushChangesPayload & {
  changedSlices: ReadonlyArray<ChangedSlice>;
  changedCustomTypes: ReadonlyArray<ChangedCustomType>;
};

type Limit = NonNullable<
  Awaited<
    ReturnType<SliceMachineManagerClient["prismicRepository"]["pushChanges"]>
  >
>;

export const changesPushCreator = createAsyncAction(
  "PUSH_CHANGES.REQUEST",
  "PUSH_CHANGES.RESPONSE",
  "PUSH_CHANGES.FAILURE"
)<ChangesPushSagaPayload, undefined, Limit | InvalidCustomTypeResponse>();

export const sortDocumentLimits = (limit: Readonly<Limit>) => ({
  ...limit,
  details: {
    ...limit.details,
    customTypes: [...limit.details.customTypes].sort(
      (doc1, doc2) => doc2.numberOfDocuments - doc1.numberOfDocuments
    ),
  },
});

const MODAL_KEY_MAP = {
  ["INVALID_CUSTOM_TYPES"]: ModalKeysEnum.REFERENCES_MISSING_DRAWER,
  ["SOFT"]: ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER,
  ["HARD"]: ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER,
};

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator.request>): Generator {
  const startTime = Date.now();
  const { changedSlices, changedCustomTypes } = payload;

  const sliceChanges = changedSlices.map((sliceChange) => ({
    id: sliceChange.slice.model.id,
    type: "Slice" as const,
    libraryID: sliceChange.slice.from,
    status: sliceChange.status,
  }));
  const customTypeChanges = changedCustomTypes.map((customTypeChange) => ({
    id: customTypeChange.customType.id,
    type: "CustomType" as const,
    status: customTypeChange.status,
  }));

  // Creating a new payload with the correct format
  const pushPayload = {
    confirmDeleteDocuments: payload.confirmDeleteDocuments,
    changes: [...sliceChanges, ...customTypeChanges],
  };

  try {
    const response = (yield call(pushChanges, pushPayload)) as SagaReturnType<
      typeof pushChanges
    >;

    if (response) {
      // sending failure event
      yield put(changesPushCreator.failure(sortDocumentLimits(response)));
      // Tracking when a limit has been reached
      void telemetry.track({
        event: "changes:limit-reach",
        limitType: response.type,
      });
      // Open the corresponding drawer
      yield put(
        modalOpenCreator({
          modalKey: MODAL_KEY_MAP[response.type],
        })
      );
      return;
    }

    const serverState = (yield call(getState)) as SagaReturnType<
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
        content: "All slices and types have been pushed",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (error) {
    if (isUnauthenticatedError(error) || isUnauthorizedError(error)) {
      yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
      return;
    }
    // TODO: handle auth errors
    yield put(
      openToasterCreator({
        content:
          "Something went wrong when pushing your changes. Check your terminal logs.",
        type: ToasterType.ERROR,
      })
    );
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
