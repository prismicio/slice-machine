/**
 * Combine all reducers in this file and export the combined reducers. If we
 * were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { routerReducer } from "connected-next-router";
import { combineReducers, Reducer } from "redux";

import { availableCustomTypesReducer } from "@/modules/availableCustomTypes";
import { environmentReducer } from "@/modules/environment";
import { loadingReducer } from "@/modules/loading";
import { modalReducer } from "@/modules/modal";
import { slicesReducer } from "@/modules/slices";
import { userContextReducer } from "@/modules/userContext";

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
