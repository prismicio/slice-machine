import {
  render as rtlRender,
  RenderOptions,
  queryHelpers,
  buildQueries,
  Matcher,
  MatcherOptions,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Store, AnyAction } from "redux";

import { Provider } from "react-redux";
import type { SliceMachineStoreType } from "../../src/redux/type";
import configureStore from "../../src/redux/store";
import theme from "../../src/theme";
import { ThemeProvider as ThemeUIThemeProvider, BaseStyles } from "theme-ui";

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
        <BaseStyles>
          <Provider store={store}>{children}</Provider>
        </BaseStyles>
      </ThemeUIThemeProvider>
    );
  }
  return {
    user: userEvent.setup(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// The queryAllByAttribute is a shortcut for attribute-based matchers
// You can also use document.querySelector or a combination of existing
// testing library utilities to find matching nodes for your query
const queryAllByDataCy = (
  container: HTMLElement,
  id: Matcher,
  options?: MatcherOptions | undefined,
) => queryHelpers.queryAllByAttribute("data-cy", container, id, options);

const [
  queryByDataCy,
  getAllByDataCy,
  getByDataCy,
  findAllByDataCy,
  findByDataCy,
] = buildQueries(
  queryAllByDataCy,
  (_c, dataCyValue) =>
    `Found multiple elements with the data-cy attribute of: ${dataCyValue}`,
  (_c, dataCyValue) =>
    `Unable to find an element with the data-cy attribute of: ${dataCyValue}`,
);

export {
  queryByDataCy,
  queryAllByDataCy,
  getByDataCy,
  getAllByDataCy,
  findAllByDataCy,
  findByDataCy,
};

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };
