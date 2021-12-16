import { createStore, compose, applyMiddleware, Store } from "redux";
import createReducer from "./reducer";
import { persistStore, persistReducer } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import storage from "redux-persist/lib/storage";
import { SliceMachineStoreType } from "@src/redux/type";
import { Persistor } from "redux-persist/es/types"; // defaults to localStorage for web
import rootSaga from "./saga";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["userContext"],
};

const sagaMiddleware = createSagaMiddleware();

declare const window: {
  // eslint-disable-next-line
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
};

export default function configureStore(
  preloadedState: Partial<SliceMachineStoreType> = {}
): { store: Store; persistor: Persistor } {
  const middlewares = [sagaMiddleware];
  const enhancers = [applyMiddleware(...middlewares)];

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
    composeEnhancers(...enhancers)
  );
  const persistor = persistStore(store);
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}
