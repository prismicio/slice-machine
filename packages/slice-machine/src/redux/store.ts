import { createRouterMiddleware } from "connected-next-router";
import { applyMiddleware, compose, createStore, Store } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import { Persistor } from "redux-persist/es/types"; // defaults to localStorage for web
import storage from "redux-persist/lib/storage";

import { SliceMachineStoreType } from "@/redux/type";

import createReducer from "./reducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["userContext"],
};

const routerMiddleware = createRouterMiddleware();

declare const window: {
  // eslint-disable-next-line
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
};

export default function configureStore(
  preloadedState: Partial<SliceMachineStoreType> = {},
): { store: Store<SliceMachineStoreType>; persistor: Persistor } {
  const middlewares = [routerMiddleware];
  const enhancers = [applyMiddleware(...middlewares)];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const composeEnhancers =
    process.env.NODE_ENV !== "production" &&
    typeof window === "object" &&
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          trace: true,
          traceLimit: 25,
        })
      : compose;

  const rootReducer = createReducer();

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store: Store<SliceMachineStoreType> = createStore(
    persistedReducer,
    preloadedState,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    composeEnhancers(...enhancers),
  );
  const persistor = persistStore(store);

  return { store, persistor };
}
