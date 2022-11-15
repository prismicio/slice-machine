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
import Tracker from "@src/tracking/client";

export function* generateSliceScreenshotSaga({
  payload,
}: ReturnType<typeof generateSliceScreenshotCreator.request>) {
  const { component, variationId, screenDimensions, method } = payload;
  try {
    const response = (yield call(generateSliceScreenshotApiClient, {
      libraryName: component.from,
      sliceName: component.model.name,
      href: component.href,
      baseUrl: window.location.origin,
      variationId,
      screenDimensions,
    })) as SagaReturnType<typeof generateSliceScreenshotApiClient>;

    // If screenshot is null, then no screenshots were taken
    if (!response.data.screenshot) {
      throw Error("No screenshot saved");
    }

    yield put(
      openToasterCreator({
        url: response.data.screenshot.url,
        type: ToasterType.SCREENSHOT_CAPTURED,
      })
    );

    void Tracker.get().trackScreenshotTaken({
      type: "automatic",
      method: method,
    });

    yield put(
      generateSliceScreenshotCreator.success({
        variationId,
        screenshot: response.data.screenshot,
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
  const { variationId, component, file, method } = payload;
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("libraryName", component.from);
    form.append("sliceName", component.model.name);
    form.append("variationId", variationId);
    const response = (yield call(
      generateSliceCustomScreenshotApiClient,
      form
    )) as SagaReturnType<typeof generateSliceCustomScreenshotApiClient>;

    void Tracker.get().trackScreenshotTaken({
      type: "custom",
      method: method,
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
