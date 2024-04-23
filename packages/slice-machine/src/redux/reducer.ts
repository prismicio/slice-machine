/**
 * Combine all reducers in this file and export the combined reducers. If we
 * were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { availableCustomTypesReducer } from "@src/modules/availableCustomTypes";
import { environmentReducer } from "@src/modules/environment";
import { loadingReducer } from "@src/modules/loading";
import { modalReducer } from "@src/modules/modal";
import { slicesReducer } from "@src/modules/slices";
import { userContextReducer } from "@src/modules/userContext";
import { routerReducer } from "connected-next-router";
import { combineReducers, Reducer } from "redux";

/** Creates the main reducer */
const createReducer = (): Reducer =>
  combineReducers({
    modal: modalReducer,
    loading: loadingReducer,
    userContext: userContextReducer,
    environment: environmentReducer,
    availableCustomTypes: availableCustomTypesReducer,
    slices: slicesReducer,
    router: routerReducer,
  });

export default createReducer;
