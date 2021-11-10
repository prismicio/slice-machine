import { createStore, applyMiddleware, compose } from "redux";
import createReducer from "./reducer";
import { SliceMachineStoreType } from "@src/redux/type";

declare var window: {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
};

export default function configureStore(
  initialState: SliceMachineStoreType = {}
) {
  const middlewares = [];

  const enhancers = [applyMiddleware(...middlewares)];

  const composeEnhancers =
    process.env.NODE_ENV !== "production" &&
    typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const rootReducer = createReducer();

  const store: any = createStore(
    rootReducer,
    initialState,
    composeEnhancers(...enhancers)
  );

  store.asyncReducers = {};

  return { store };
}
