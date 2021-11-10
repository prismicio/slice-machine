/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers } from "redux";
import { modalReducer } from "@src/modules/modal/modal";

/**
 * Creates the main reducer
 */
const createReducer = () =>
  combineReducers({
    modal: modalReducer,
  });

export default createReducer;
