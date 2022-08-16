import {
  call,
  fork,
  takeLatest,
  put,
  SagaReturnType,
  select,
  takeEvery,
} from "redux-saga/effects";
import axios from "axios";
import { getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";
import {
  generateSliceScreenshotCreator,
  generateSliceCustomScreenshotCreator,
  saveSliceCreator,
  pushSliceCreator,
} from "./actions";
import {
  generateSliceScreenshotApiClient,
  generateSliceCustomScreenshotApiClient,
  saveSliceApiClient,
  pushSliceApiClient,
  renameSlice,
} from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { getRemoteSlice, renameSliceCreator } from "../slices";
import { modalCloseCreator } from "../modal";
import { ModalKeysEnum } from "../modal/types";
import { push } from "connected-next-router";

export function* generateSliceScreenshotSaga({
  payload,
}: ReturnType<typeof generateSliceScreenshotCreator.request>) {
  const { component, setData } = payload;
  try {
    setData({
      loading: true,
      done: false,
      error: null,
      status: null,
      imageLoading: true,
    });
    const response = (yield call(
      generateSliceScreenshotApiClient,
      component.model.name,
      component.from
    )) as SagaReturnType<typeof generateSliceScreenshotApiClient>;
    if (response.status > 209) {
      return setData({
        loading: false,
        done: true,
        error: response.data.err,
        status: response.status,
        message: response.data.reason,
        imageLoading: false,
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      warning: !!response.data.warning,
      status: response.status,
      message: response.data.warning || "Screenshots were saved to FileSystem",
      imageLoading: false,
    });
    yield put(
      generateSliceScreenshotCreator.success({
        screenshots: response.data.screenshots,
        component,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Screenshot not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* generateSliceCustomScreenshotSaga({
  payload,
}: ReturnType<typeof generateSliceCustomScreenshotCreator.request>) {
  const { variationId, component, setData, file } = payload;
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("libraryName", component.from);
    form.append("sliceName", component.model.name);
    form.append("variationId", variationId);
    setData({
      loading: true,
      done: false,
      error: null,
      status: null,
      imageLoading: true,
    });
    const response = (yield call(
      generateSliceCustomScreenshotApiClient,
      form
    )) as SagaReturnType<typeof generateSliceCustomScreenshotApiClient>;
    if (response.status > 209) {
      return setData({
        loading: false,
        done: true,
        status: response.status,
        imageLoading: false,
        error: "Internal Error: Custom screenshot not saved",
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      status: response.status,
      message: "New screenshot added!",
      imageLoading: false,
    });
    yield put(
      generateSliceCustomScreenshotCreator.success({
        variationId,
        screenshot: response.data,
        component,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Custom screenshot not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* saveSliceSaga({
  payload,
}: ReturnType<typeof saveSliceCreator.request>) {
  const { component, setData } = payload;
  try {
    setData({
      loading: true,
      done: false,
      error: null,
      status: null,
      message: null,
    });
    const response = (yield call(
      saveSliceApiClient,
      component
    )) as SagaReturnType<typeof saveSliceApiClient>;
    if (response.status > 209) {
      return setData({
        loading: false,
        done: true,
        error: response.data.err,
        status: response.status,
        message: response.data.reason,
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      warning: !!response.data.warning,
      status: response.status,
      message:
        response.data.warning ||
        "Models & mocks have been generated successfully!",
    });
    const remoteSlice = (yield select(
      getRemoteSlice,
      component.model.id
    )) as ReturnType<typeof getRemoteSlice>;

    yield put(
      saveSliceCreator.success({
        component,
        remoteSliceVariations: remoteSlice?.variations,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Models & mocks not generated",
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* pushSliceSaga({
  payload,
}: ReturnType<typeof pushSliceCreator.request>) {
  const { component, onPush } = payload;
  try {
    onPush({
      imageLoading: true,
      loading: true,
      done: false,
      error: null,
      status: null,
    });
    const response = (yield call(
      pushSliceApiClient,
      component
    )) as SagaReturnType<typeof pushSliceApiClient>;
    if (response.status > 209) {
      return onPush({
        imageLoading: false,
        loading: false,
        done: true,
        error: null,
        status: response.status,
      });
    }
    onPush({
      imageLoading: false,
      loading: false,
      done: true,
      error: null,
      status: response.status,
    });

    yield put(pushSliceCreator.success({ component }));
    yield put(
      openToasterCreator({
        message: "Model was correctly saved to Prismic!",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    const status = axios.isAxiosError(e) ? e.response?.status || null : null;
    onPush({
      imageLoading: false,
      loading: false,
      done: true,
      status: status,
      error:
        status === 403
          ? "Authentication Error: User is not logged in"
          : "Internal Error: Slice was not pushed",
    });
    if (status !== 403) {
      yield put(
        openToasterCreator({
          message: "Internal Error: Slice was not pushed",
          type: ToasterType.ERROR,
        })
      );
    }
  }
}

export function* renameSliceSaga({
  payload,
}: ReturnType<typeof renameSliceCreator.request>) {
  const { libName, sliceId, newSliceName } = payload;
  try {
    yield call(renameSlice, sliceId, newSliceName, libName);
    yield put(renameSliceCreator.success({ libName, sliceId, newSliceName }));
    yield put(modalCloseCreator({ modalKey: ModalKeysEnum.RENAME_SLICE }));
    const addr = `/${payload.libName.replace(/\//g, "--")}/${
      payload.newSliceName
    }/${payload.variationId}`;
    yield put(push(addr));
    yield put(
      openToasterCreator({
        message: "Slice name updated",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Slice name not saved",
        type: ToasterType.ERROR,
      })
    );
  }
}

function* watchGenerateSliceScreenshot() {
  yield takeEvery(
    getType(generateSliceScreenshotCreator.request),
    withLoader(
      generateSliceScreenshotSaga,
      LoadingKeysEnum.GENERATE_SLICE_SCREENSHOT
    )
  );
}
function* watchGenerateSliceCustomScreenshot() {
  yield takeLatest(
    getType(generateSliceCustomScreenshotCreator.request),
    withLoader(
      generateSliceCustomScreenshotSaga,
      LoadingKeysEnum.GENERATE_SLICE_CUSTOM_SCREENSHOT
    )
  );
}
function* watchSaveSlice() {
  yield takeLatest(
    getType(saveSliceCreator.request),
    withLoader(saveSliceSaga, LoadingKeysEnum.SAVE_SLICE)
  );
}
function* watchPushSlice() {
  yield takeLatest(
    getType(pushSliceCreator.request),
    withLoader(pushSliceSaga, LoadingKeysEnum.PUSH_SLICE)
  );
}
function* watchRenameSlice() {
  yield takeLatest(
    getType(renameSliceCreator.request),
    withLoader(renameSliceSaga, LoadingKeysEnum.RENAME_SLICE)
  );
}

// Saga Exports
export function* selectedSliceSagas() {
  yield fork(watchGenerateSliceScreenshot);
  yield fork(watchGenerateSliceCustomScreenshot);
  yield fork(watchSaveSlice);
  yield fork(watchPushSlice);
  yield fork(watchRenameSlice);
}
