import { fork } from "redux-saga/effects";

import { watchSimulatorSagas } from "@src/modules/simulator";

// Single entry point to start all Sagas at once
export default function* rootSaga() {
  yield fork(watchSimulatorSagas);
}
