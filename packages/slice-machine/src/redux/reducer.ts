/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers } from "redux";
import { modalReducer } from "@src/modules/modal";
import { loadingReducer } from "@src/modules/loading";
import { userContextReducer } from "@src/modules/userContext";
import { environmentReducer } from "@src/modules/environment";
import { updateNotificationReducer } from "@src/modules/update";

/**
 * Creates the main reducer
 */
const createReducer = () =>
  combineReducers({
    modal: modalReducer,
    loading: loadingReducer,
    userContext: userContextReducer,
    environment: environmentReducer,
    updateVersionInfo: updateNotificationReducer,
  });

export default createReducer;
