import { call, fork, put, select, takeLatest } from "redux-saga/effects";
import { openToasterCreator, ToasterType } from "../toaster";
import { getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";
import { pushCustomTypeCreator, saveCustomTypeCreator } from "./actions";
import { selectCurrentCustomType, selectCurrentMockConfig } from "./index";
import { pushCustomType, saveCustomType } from "../../apiClient";
import axios from "axios";
import { modalOpenCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import Tracker from "../../tracking/client";

export function* saveCustomTypeSaga() {
  try {
    const currentCustomType = (yield select(
      selectCurrentCustomType
    )) as ReturnType<typeof selectCurrentCustomType>;
    const currentMockConfig = (yield select(
      selectCurrentMockConfig
    )) as ReturnType<typeof selectCurrentMockConfig>;

    if (!currentCustomType || !currentMockConfig) {
      return;
    }

    yield call(saveCustomType, currentCustomType, currentMockConfig);
    void Tracker.get().trackCustomTypeSaved({
      id: currentCustomType.id,
      name: currentCustomType.label || currentCustomType.id,
      type: currentCustomType.repeatable ? "repeatable" : "single",
    });
    yield put(
      saveCustomTypeCreator.success({ customTypeId: currentCustomType.id })
    );
    yield put(
      openToasterCreator({
        message: "Model & mocks have been generated successfully!",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    // Unknown errors
    yield put(
      openToasterCreator({
        message: "Internal Error: Custom type not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* pushCustomTypeSaga() {
  try {
    const currentCustomType = (yield select(
      selectCurrentCustomType
    )) as ReturnType<typeof selectCurrentCustomType>;

    if (!currentCustomType) {
      return;
    }

    yield call(pushCustomType, currentCustomType.id);
    void Tracker.get().trackCustomTypePushed({
      id: currentCustomType.id,
      name: currentCustomType.label || currentCustomType.id,
      type: currentCustomType.repeatable ? "repeatable" : "single",
    });
    yield put(
      pushCustomTypeCreator.success({ customTypeId: currentCustomType.id })
    );
    yield put(
      openToasterCreator({
        message: "Model was correctly saved to Prismic!",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      // Auth error
      if (e.response.status === 403) {
        yield put(modalOpenCreator({ modalKey: ModalKeysEnum.LOGIN }));
        return;
      }
      // Other server errors
      if (e.response.status > 209) {
        yield put(
          openToasterCreator({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            message: e.response.data.reason,
            type: ToasterType.ERROR,
          })
        );
        return;
      }
    }

    // Unknown errors
    yield put(
      openToasterCreator({
        message: "Internal Error: Custom type not pushed",
        type: ToasterType.ERROR,
      })
    );
  }
}

// Saga watchers
function* watchSaveCustomType() {
  yield takeLatest(
    getType(saveCustomTypeCreator.request),
    withLoader(saveCustomTypeSaga, LoadingKeysEnum.SAVE_CUSTOM_TYPE)
  );
}

function* watchPushCustomType() {
  yield takeLatest(
    getType(pushCustomTypeCreator.request),
    withLoader(pushCustomTypeSaga, LoadingKeysEnum.PUSH_CUSTOM_TYPE)
  );
}

// Saga Exports
export function* watchSelectedCustomTypeSagas() {
  yield fork(watchSaveCustomType);
  yield fork(watchPushCustomType);
}
