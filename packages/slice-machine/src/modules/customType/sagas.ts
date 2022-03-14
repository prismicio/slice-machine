import {call, fork, put, select, takeLatest} from "redux-saga/effects";
import {openToasterCreator, ToasterType} from "@src/modules/toaster";
import {getType} from "typesafe-actions";
import {withLoader} from "@src/modules/loading";
import {LoadingKeysEnum} from "@src/modules/loading/types";
import { saveCustomTypeCreator } from "@src/modules/customType/actions";
import {selectCurrentCustomType, selectCurrentMockConfig} from "@src/modules/customType/index";
import { saveCustomType } from "@src/apiClient";
import {ArrayTabs, CustomType} from "@models/common/CustomType";

export function* saveCustomTypeSaga() {
  try {
    const currentCustomType: CustomType<ArrayTabs> | null = yield select(selectCurrentCustomType);
    const currentMockConfig: any | null = yield select(selectCurrentMockConfig);

    if (!currentCustomType || !currentMockConfig) {
      return;
    }

    yield call(saveCustomType, CustomType.toObject(currentCustomType), currentMockConfig);
    yield put(
      openToasterCreator({
        message: "Model & mocks have been generated successfully!",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
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
export function* watchCustomTypeSagas() {
  yield fork(watchSaveCustomType);
}