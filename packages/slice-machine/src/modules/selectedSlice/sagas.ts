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
  saveSliceCreator,
  pushSliceCreator,
} from "./actions";
import {
  generateSliceScreenshotAxios,
  generateSliceCustomScreenshotAxios,
  saveSliceAxios,
  pushSliceAxios,
  renameSlice,
  getState,
} from "@src/apiClient";
import { openToasterCreator, ToasterType } from "@src/modules/toaster";
import { renameSliceCreator } from "../slices";
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
      generateSliceScreenshotAxios,
      component.model.name,
      component.from
    )) as SagaReturnType<typeof generateSliceScreenshotAxios>;
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
      generateSliceCustomScreenshotAxios,
      form
    )) as SagaReturnType<typeof generateSliceCustomScreenshotAxios>;
    if (response.status > 209) {
      return setData({
        loading: false,
        done: true,
        status: response.status,
        imageLoading: false,
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
  const { extendedComponent, setData } = payload;
  try {
    setData({
      loading: true,
      done: false,
      error: null,
      status: null,
      message: null,
    });
    const response = (yield call(
      saveSliceAxios,
      extendedComponent
    )) as SagaReturnType<typeof saveSliceAxios>;
    if (response.status > 209) {
      return setData({
        loading: false,
        done: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: response.data.err,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        status: response.status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: response.data.reason,
      });
    }
    setData({
      loading: false,
      done: true,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      warning: !!response.data.warning,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      status: response.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      message:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        response.data.warning ||
        "Models & mocks have been generated successfully!",
    });
    yield put(
      saveSliceCreator.success({
        extendedComponent,
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
  const { extendedComponent, onPush } = payload;
  try {
    onPush({
      imageLoading: true,
      loading: true,
      done: false,
      error: null,
      status: null,
    });
    const response = (yield call(
      pushSliceAxios,
      extendedComponent.component
    )) as SagaReturnType<typeof pushSliceAxios>;
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
    yield put(
      pushSliceCreator.success({
        extendedComponent,
      })
    );
    yield put(
      openToasterCreator({
        message: "Model was correctly saved to Prismic!",
        type: ToasterType.SUCCESS,
      })
    );
  } catch (e) {
    yield put(
      openToasterCreator({
        message: "Internal Error: Slice was not pushed",
        type: ToasterType.ERROR,
      })
    );
  }
}

export function* renameSliceSaga({
  payload,
}: ReturnType<typeof renameSliceCreator.request>) {
  try {
    yield call(
      renameSlice,
      payload.sliceId,
      payload.newSliceName,
      payload.libName
    );
    //TODO: avoid refetch of state. Either manually update all the changes within the reducer,
    //or make the renameSlice api call return the new libraries, so that it's output can be used.
    const { data: serverState } = (yield call(getState)) as SagaReturnType<
      typeof getState
    >;
    yield put(renameSliceCreator.success({ libraries: serverState.libraries }));
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
