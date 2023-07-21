import { createStore, compose, applyMiddleware, Store } from "redux";
import createReducer from "./reducer";
import { persistStore, persistReducer } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import storage from "redux-persist/lib/storage";
import { SliceMachineStoreType } from "@src/redux/type";
import { Persistor } from "redux-persist/es/types"; // defaults to localStorage for web
import { createRouterMiddleware } from "connected-next-router";
import rootSaga from "./saga";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["userContext"],
};

const routerMiddleware = createRouterMiddleware();
const sagaMiddleware = createSagaMiddleware();

declare const window: {
  // eslint-disable-next-line
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
};

export default function configureStore(
  preloadedState: Partial<SliceMachineStoreType> = {}
): { store: Store<SliceMachineStoreType>; persistor: Persistor } {
  const middlewares = [sagaMiddleware, routerMiddleware];
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
    composeEnhancers(...enhancers)
  );
  const persistor = persistStore(store);
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}
