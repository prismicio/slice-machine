/**
 * Combine all reducers in this file and export the combined reducers. If we
 * were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers, Reducer } from "redux";
import { modalReducer } from "@src/modules/modal";
import { loadingReducer } from "@src/modules/loading";
import { userContextReducer } from "@src/modules/userContext";
import { environmentReducer } from "@src/modules/environment";
import { simulatorReducer } from "@src/modules/simulator";
import { availableCustomTypesReducer } from "@src/modules/availableCustomTypes";
import { selectedCustomTypeReducer } from "@src/modules/selectedCustomType";
import { slicesReducer } from "@src/modules/slices";
import { routerReducer } from "connected-next-router";
import { selectedSliceReducer } from "@src/modules/selectedSlice/reducer";
import { pushChangesReducer } from "@src/modules/pushChangesSaga";

/** Creates the main reducer */
const createReducer = (): Reducer =>
  combineReducers({
    modal: modalReducer,
    loading: loadingReducer,
    userContext: userContextReducer,
    environment: environmentReducer,
    simulator: simulatorReducer,
    availableCustomTypes: availableCustomTypesReducer,
    selectedCustomType: selectedCustomTypeReducer,
    slices: slicesReducer,
    selectedSlice: selectedSliceReducer,
    router: routerReducer,
    pushChanges: pushChangesReducer,
  });

export default createReducer;
