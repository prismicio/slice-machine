/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { expect, test } from "@jest/globals";
import { render, RenderArgs, fireEvent, screen } from "../../test-utils";
import { ThemeProvider } from "@theme-ui/core";
import theme from "../../../src/theme";
import SliceBuilder from "../../../lib/builders/SliceBuilder";
import { SliceContext, ContextProps } from "../../../src/models/slice/context";
import { TrackerContext, ClientTracker } from "../../../src/utils/tracker";
import ToastProvider from "../../../src/ToastProvider";
import { AnalyticsBrowser } from "@segment/analytics-next";

import StubSliceContext from "../../__mockData__/sliceContext";
import { EnvironmentStoreType } from "@src/modules/environment/types";

const renderWithContext = (
  ui: any,
  {
    trackerContext,
    sliceContext,
    ...renderOpts
  }: {
    trackerContext: ClientTracker;
    sliceContext: Partial<ContextProps>;
  } & RenderArgs
) =>
  render(
    <ThemeProvider theme={theme}>
      <TrackerContext.Provider value={trackerContext}>
        <SliceContext.Provider value={sliceContext}>
          <ToastProvider>{ui}</ToastProvider>
        </SliceContext.Provider>
      </TrackerContext.Provider>
    </ThemeProvider>,
    renderOpts
  );

jest.mock("@segment/analytics-next", () => {
  return {
    AnalyticsBrowser: {
      standalone: jest.fn().mockReturnThis(),
      track: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  };
});

jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "",
      asPath: "",
    };
  },
}));

jest.mock("@segment/analytics-next", () => {
  return {
    AnalyticsBrowser: {
      standalone: jest.fn().mockReturnThis(),
      track: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  };
});

afterEach(() => {
  jest.resetAllMocks();
});

test("when setup drawer is open it should call the tracking service, once only", async () => {
  const div = document.createElement("div");
  div.setAttribute("id", "__next");
  document.body.appendChild(div);

  const tracker = (await ClientTracker.build("foo", "bar")) as ClientTracker;

  renderWithContext(<SliceBuilder />, {
    trackerContext: tracker,
    sliceContext: StubSliceContext as unknown as ContextProps,
    preloadedState: {
      environment: {
        env: {
          framework: "next",
          updateVersionInfo: {
            currentVersion: "0.2.0-alpha.17",
          },
          manifest: {
            localSliceCanvasURL: "",
          },
        },
      } as unknown as EnvironmentStoreType,
    },
  });

  expect(AnalyticsBrowser.standalone).toHaveBeenCalled();

  const getOpenButton = () => screen.getByTestId("open-set-up-preview");
  const getCloseButton = () => screen.getByTestId("close-set-up-preview");
  fireEvent.click(getOpenButton());
  fireEvent.click(getCloseButton());
  fireEvent.click(getOpenButton());

  // @ts-expect-error
  expect(AnalyticsBrowser.track).toHaveBeenCalledTimes(1);
  // @ts-expect-error
  expect(AnalyticsBrowser.track).toHaveBeenCalledWith("Slice Preview Setup", {
    framework: "next",
    version: "0.2.0-alpha.17",
  });
});

test("when setup drawer is open, but trakcing is set to false it should not call tracking", async () => {
  const div = document.createElement("div");
  div.setAttribute("id", "__next");
  document.body.appendChild(div);

  const tracker = (await ClientTracker.build(
    "foo",
    "bar",
    false
  )) as ClientTracker;

  renderWithContext(<SliceBuilder />, {
    trackerContext: tracker,
    sliceContext: StubSliceContext as unknown as ContextProps,
    preloadedState: {
      environment: {
        env: {
          framework: "next",
          updateVersionInfo: {
            currentVersion: "0.2.0-alpha.17",
          },
          manifest: {
            localSliceCanvasURL: "",
            tracking: false,
          },
        },
      } as unknown as EnvironmentStoreType,
    },
  });

  expect(AnalyticsBrowser.standalone).toHaveBeenCalled();

  const getOpenButton = () => screen.getByTestId("open-set-up-preview");
  const getCloseButton = () => screen.getByTestId("close-set-up-preview");
  fireEvent.click(getOpenButton());
  fireEvent.click(getCloseButton());
  fireEvent.click(getOpenButton());

  // @ts-expect-error
  expect(AnalyticsBrowser.track).not.toHaveBeenCalled();
});
