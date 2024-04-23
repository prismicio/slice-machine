import { TooltipProvider } from "@prismicio/editor-ui";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { AnyAction, Store } from "redux";
import { BaseStyles, ThemeProvider as ThemeUIThemeProvider } from "theme-ui";

import { ErrorBoundary } from "@/ErrorBoundary";

import configureStore from "../../src/redux/store";
import type { SliceMachineStoreType } from "../../src/redux/type";
import theme from "../../src/theme";

export type RenderArgs = Partial<
  {
    preloadedState: Partial<SliceMachineStoreType>;
    store: Store<SliceMachineStoreType, AnyAction>;
  } & RenderOptions
>;

export type RenderReturnType = ReturnType<typeof rtlRender> & {
  user: ReturnType<typeof userEvent.setup>;
};

function render(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ui: any,
  {
    preloadedState,
    store = configureStore(preloadedState).store,
    ...renderOptions
  }: RenderArgs = {},
): RenderReturnType {
  if (!document.getElementById("__next")) {
    const div = document.createElement("div");
    div.setAttribute("id", "__next");
    document.body.appendChild(div);
  }

  function Wrapper({
    children,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: any;
  }) {
    return (
      <ThemeUIThemeProvider theme={theme}>
        <TooltipProvider>
          <BaseStyles>
            <Provider store={store}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </Provider>
          </BaseStyles>
        </TooltipProvider>
      </ThemeUIThemeProvider>
    );
  }
  return {
    user: userEvent.setup(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };
