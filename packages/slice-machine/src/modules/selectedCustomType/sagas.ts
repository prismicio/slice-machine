import { call, fork, put, select, takeLatest } from "redux-saga/effects";
import { openToasterCreator, ToasterType } from "../toaster";
import { getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";
import { saveCustomTypeCreator } from "./actions";
import { selectCurrentCustomType, selectCurrentMockConfig } from "./index";
import { saveCustomType } from "../../apiClient";
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
    yield put(saveCustomTypeCreator.success({ customType: currentCustomType }));
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

// Saga watchers
function* watchSaveCustomType() {
  yield takeLatest(
    getType(saveCustomTypeCreator.request),
    withLoader(saveCustomTypeSaga, LoadingKeysEnum.SAVE_CUSTOM_TYPE)
  );
}

// Saga Exports
export function* watchSelectedCustomTypeSagas() {
  yield fork(watchSaveCustomType);
}
