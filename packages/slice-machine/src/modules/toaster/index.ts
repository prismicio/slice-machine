import { toast } from "react-toastify";
import { createAction, getType } from "typesafe-actions";
import { fork, takeLatest } from "redux-saga/effects";

export enum ToasterType {
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
}

// Action Creators
export const openToasterCreator = createAction("TOASTER/OPEN")<{
  message: string;
  type: ToasterType;
}>();

// Sagas
function* openToasterSaga(action: ReturnType<typeof openToasterCreator>) {
  switch (action.payload.type) {
    case ToasterType.SUCCESS:
      toast.success(action.payload.message, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      break;
    case ToasterType.ERROR:
      toast.error(action.payload.message, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      break;
    case ToasterType.INFO:
      toast.info(action.payload.message, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      break;
    case ToasterType.WARNING:
      toast.warning(action.payload.message, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
      break;
  }
}

// Saga watchers
function* watchOpenToaster() {
  yield takeLatest(getType(openToasterCreator), openToasterSaga);
}

// Saga Exports
export function* watchToasterSagas() {
  yield fork(watchOpenToaster);
}
