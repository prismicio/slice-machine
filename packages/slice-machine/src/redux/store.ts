import { createStore, compose, Store } from "redux";
import createReducer from "./reducer";
import { EnvironmentStoreType } from "@src/modules/environment/types";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { SliceMachineStoreType } from "@src/redux/type";
import { Persistor } from "redux-persist/es/types"; // defaults to localStorage for web

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["userContext"],
};

declare const window: {
  // eslint-disable-next-line
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
};

export default function configureStore(
  preloadedState: {
    environment: EnvironmentStoreType;
  } & Partial<SliceMachineStoreType>
): { store: Store; persistor: Persistor } {
  const composeEnhancers =
    process.env.NODE_ENV !== "production" &&
    typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const rootReducer = createReducer(preloadedState.environment);

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store: Store<SliceMachineStoreType> = createStore(
    persistedReducer,
    preloadedState,
    composeEnhancers()
  );
  const persistor = persistStore(store);

  return { store, persistor };
}
