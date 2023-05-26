import { call, fork, put, select, takeLatest } from "redux-saga/effects";
import { openToasterCreator, ToasterType } from "../toaster";
import { getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";
import { saveCustomTypeCreator } from "./actions";
import { selectCurrentCustomType } from "./index";
import { saveCustomType, telemetry } from "@src/apiClient";

export function* saveCustomTypeSaga() {
  try {
    const currentCustomType = (yield select(
      selectCurrentCustomType
    )) as ReturnType<typeof selectCurrentCustomType>;

    if (!currentCustomType) {
      return;
    }

    const { errors } = (yield call(
      saveCustomType,
      currentCustomType
    )) as Awaited<ReturnType<typeof saveCustomType>>;
    if (errors.length) {
      throw errors;
    }
    void telemetry.track({
      event: "custom-type:saved",
      id: currentCustomType.id,
      name: currentCustomType.label ?? currentCustomType.id,
      format: currentCustomType.format,
      type: currentCustomType.repeatable ? "repeatable" : "single",
    });
    yield put(saveCustomTypeCreator.success({ customType: currentCustomType }));
    yield put(
      openToasterCreator({
        content: "Model & mocks have been generated successfully!",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    // Unknown errors
    yield put(
      openToasterCreator({
        content: "Internal Error: Custom type not saved",
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
