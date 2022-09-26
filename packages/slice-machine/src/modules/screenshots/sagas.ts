import {
  call,
  fork,
  takeLatest,
  put,
  SagaReturnType,
} from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { withLoader } from "../loading";
import { LoadingKeysEnum } from "../loading/types";
import {
  generateSliceScreenshotCreator,
  generateSliceCustomScreenshotCreator,
} from "./actions";
import {
  generateSliceScreenshotApiClient,
  generateSliceCustomScreenshotApiClient,
} from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";

export function* generateSliceScreenshotSaga({
  payload,
}: ReturnType<typeof generateSliceScreenshotCreator.request>) {
  const { component, variationId, setData, screenWidth } = payload;
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
      component.from,
      variationId,
      screenWidth
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

function* watchGenerateSliceScreenshot() {
  yield takeLatest(
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

// Saga Exports
export function* screenshotsSagas() {
  yield fork(watchGenerateSliceScreenshot);
  yield fork(watchGenerateSliceCustomScreenshot);
}
