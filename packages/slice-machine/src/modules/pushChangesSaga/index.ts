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
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { trackPushChangesSuccess } from "./trackPushChangesSuccess";
import Tracker from "@src/tracking/client";
import { SliceMachineManagerClient } from "@slicemachine/manager/client";
import { ChangesStatus } from "@lib/models/common/ModelStatus";

export type ChangesPushSagaPayload = PushChangesPayload & {
  changedSlices: ReadonlyArray<{ c: ComponentUI; status: ChangesStatus }>;
  changedCustomTypes: ReadonlyArray<{
    c: CustomTypeSM;
    status: ChangesStatus;
  }>;
};

type Limit = NonNullable<
  Awaited<
    ReturnType<SliceMachineManagerClient["transactionalMerge"]["pushChanges"]>
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
  // INVALID_CUSTOM_TYPES: ModalKeysEnum.REFERENCES_MISSING_DRAWER,
  ["SOFT"]: ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER,
  ["HARD"]: ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER,
};

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator.request>): Generator {
  const startTime = Date.now();
  const { changedSlices, changedCustomTypes } = payload;

  const sliceChanges: Parameters<typeof pushChanges>[0]["changes"] =
    changedSlices.map((slice) => ({
      id: slice.c.model.id,
      type: "Slice",
      status: slice.status,
    }));
  const customTypeChanges: Parameters<typeof pushChanges>[0]["changes"] =
    changedCustomTypes.map((customType) => ({
      id: customType.c.id,
      type: "CustomType",
      status: customType.status,
    }));

  // Creating a new payload with the correct format
  const pushPayload: Parameters<typeof pushChanges>[0] = {
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
      void Tracker.get().trackChangesLimitReach({
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
        content: "All slices and custom types have been pushed",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (error) {
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
