import { fork } from "redux-saga/effects";

import { watchPreviewSagas } from "@src/modules/preview";

// Single entry point to start all Sagas at once
export default function* rootSaga() {
  yield fork(watchPreviewSagas);
}
