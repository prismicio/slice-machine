import React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { Store, AnyAction } from "redux";

// import { configureStore } from '@reduxjs/toolkit'
import { Provider } from "react-redux";
import type { SliceMachineStoreType } from "../src/redux/type";
import configureStore from "@src/redux/store";
// import createReducer from '@src/redux/reducer'

function render(
  ui: any,
  {
    preloadedState,
    store = configureStore(preloadedState).store,
    ...renderOptions
  }: Partial<
    {
      preloadedState: Partial<SliceMachineStoreType>;
      store: Store<SliceMachineStoreType, AnyAction>;
    } & RenderOptions
  > = {}
) {
  function Wrapper({ children }: { children: any }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };
