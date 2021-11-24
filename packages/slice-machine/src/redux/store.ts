import { createStore, compose, Store } from "redux";
import createReducer from "./reducer";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { SliceMachineStoreType } from "@src/redux/type"; // defaults to localStorage for web

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["userContext"],
};

declare var window: {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
};

export default function configureStore(
  preloadedState: Partial<SliceMachineStoreType> = {}
) {
  const composeEnhancers =
    process.env.NODE_ENV !== "production" &&
    typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const rootReducer = createReducer();

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store: Store<SliceMachineStoreType> = createStore(
    persistedReducer,
    preloadedState,
    composeEnhancers()
  );
  const persistor = persistStore(store);

  return { store, persistor };
}
