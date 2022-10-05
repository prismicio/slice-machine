import { toast, ToastOptions, UpdateOptions } from "react-toastify";
import { createAction, getType } from "typesafe-actions";
import { fork, takeLatest } from "redux-saga/effects";
import ScreenshotToaster from "@components/ScreenshotToaster";

export enum ToasterType {
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
  LOADING = "loading",
  SCREENSHOT_CAPTURED = "screenshot_captured",
}

// Action Creators
export const openToasterCreator = createAction("TOASTER/OPEN")<{
  message: string;
  type: ToasterType;
  options?: ToastOptions;
}>();

export const updateToasterCreator = createAction("TOASTER/UPDATE")<{
  toasterId: string;
  options: UpdateOptions;
}>();

export const closeToasterCreator = createAction("TOASTER/CLOSE")<{
  toasterId: string;
}>();

// Sagas
export function* openToasterSaga(
  action: ReturnType<typeof openToasterCreator>
) {
  switch (action.payload.type) {
    case ToasterType.SUCCESS:
      toast.success(action.payload.message, action.payload.options);
      break;
    case ToasterType.ERROR:
      toast.error(action.payload.message, action.payload.options);
      break;
    case ToasterType.INFO:
      toast.info(action.payload.message, action.payload.options);
      break;
    case ToasterType.WARNING:
      toast.warning(action.payload.message, action.payload.options);
      break;
    case ToasterType.LOADING:
      toast.loading(action.payload.message, action.payload.options);
      break;
    case ToasterType.SCREENSHOT_CAPTURED:
      toast(
        ScreenshotToaster({ data: { screenshotUrl: action.payload.message } })
      );
      break;
  }
}

export function* updateToasterSaga(
  action: ReturnType<typeof updateToasterCreator>
) {
  toast.update(action.payload.toasterId, action.payload.options);
}

export function* closeToasterSaga(
  action: ReturnType<typeof updateToasterCreator>
) {
  toast.dismiss(action.payload.toasterId);
}

// Saga watchers
function* watchOpenToaster() {
  yield takeLatest(getType(openToasterCreator), openToasterSaga);
}

function* watchUpdateToaster() {
  yield takeLatest(getType(updateToasterCreator), updateToasterSaga);
}

function* watchCloseToaster() {
  yield takeLatest(getType(closeToasterCreator), closeToasterSaga);
}

// Saga Exports
export function* watchToasterSagas() {
  yield fork(watchOpenToaster);
  yield fork(watchUpdateToaster);
  yield fork(watchCloseToaster);
}
