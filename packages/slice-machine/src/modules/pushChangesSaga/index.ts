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
import axios from "axios";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { trackPushChangesSuccess } from "./trackPushChangesSuccess";
import Tracker from "@src/tracking/client";

export type ChangesPushSagaPayload = PushChangesPayload & {
  unSyncedSlices: ReadonlyArray<ComponentUI>;
  unSyncedCustomTypes: ReadonlyArray<CustomTypeSM>;
  modelsStatuses: ModelStatusInformation["modelsStatuses"];
};

// TODO: move to a common place
type RawLimit = {
  details: {
    customTypes: {
      id: string;
      numberOfDocuments: number;
      url: string;
    }[];
  };
};
enum LimitType {
  SOFT = "SOFT",
  HARD = "HARD",
}
type Limit = RawLimit & {
  type: LimitType;
};

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
  [LimitType.SOFT]: ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER,
  [LimitType.HARD]: ModalKeysEnum.HARD_DELETE_DOCUMENTS_DRAWER,
};

const modelStatusToOperation = (
  status: ModelStatus
): "create" | "change" | "delete" => {
  switch (status) {
    case ModelStatus.New:
      return "create";
    case ModelStatus.Modified:
      return "change";
    case ModelStatus.Deleted:
      return "delete";
  }
  throw Error("Invalid model status");
};

export function* changesPushSaga({
  payload,
}: ReturnType<typeof changesPushCreator.request>): Generator {
  const startTime = Date.now();
  const { unSyncedSlices, unSyncedCustomTypes, modelsStatuses } = payload;

  const sliceChanges: Parameters<typeof pushChanges>[0]["changes"] =
    unSyncedSlices.map((slice) => ({
      id: slice.model.id,
      type: "Slice",
      operation: modelStatusToOperation(modelsStatuses.slices[slice.model.id]),
    }));
  const customTypeChanges: Parameters<typeof pushChanges>[0]["changes"] =
    unSyncedCustomTypes.map((customType) => ({
      id: customType.id,
      type: "CustomType",
      operation: modelStatusToOperation(
        modelsStatuses.customTypes[customType.id]
      ),
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
