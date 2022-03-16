import { call, fork, put, select, takeLatest } from "redux-saga/effects";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { getType } from "typesafe-actions";
import { withLoader } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  pushCustomTypeCreator,
  saveCustomTypeCreator,
} from "@src/modules/customType/actions";
import {
  selectCurrentCustomType,
  selectCurrentMockConfig,
} from "@src/modules/customType/index";
import { pushCustomType, saveCustomType } from "@src/apiClient";
import axios from "axios";
import { CustomType } from "@models/common/CustomType";
import { modalOpenCreator } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";

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

    yield call(
      saveCustomType,
      CustomType.toObject(currentCustomType),
      currentMockConfig
    );
    yield put(saveCustomTypeCreator.success());
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
    yield put(pushCustomTypeCreator.success());
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
export function* watchCustomTypeSagas() {
  yield fork(watchSaveCustomType);
  yield fork(watchPushCustomType);
}
