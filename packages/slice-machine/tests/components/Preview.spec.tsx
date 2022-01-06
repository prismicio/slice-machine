/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { expect, test } from "@jest/globals";
import { render, RenderArgs } from "../test-utils";

import Preview from "../../components/Preview";

import { SliceContext, ContextProps } from "../../src/models/slice/context";
import { TrackerContext, ClientTracker } from "../../src/utils/tracker";
import type { SliceMachineStoreType } from "../../src/redux/type";
import { ThemeProvider } from "theme-ui";
import { AnalyticsBrowser } from "@segment/analytics-next";
import theme from "../../src/theme";

import StubSliceContext from "../__mockData__/sliceContext";

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
        <SliceContext.Provider value={sliceContext}>{ui}</SliceContext.Provider>
      </TrackerContext.Provider>
    </ThemeProvider>,
    renderOpts
  );

const stubState = {
  environment: {
    env: {
      userId: "Marc",
      repo: "sm-env-example",
      framework: "next",
      updateVersionInfo: {
        currentVersion: "0.2.0-alpha.17",
      },
    },
  },
} as SliceMachineStoreType;

jest.mock("@segment/analytics-next", () => {
  return {
    AnalyticsBrowser: {
      standalone: jest.fn().mockReturnThis(),
      track: jest.fn().mockImplementation(() => Promise.resolve()),
    },
  };
});

test("Should send event when loaded", async () => {
  const tracker = await ClientTracker.build("foo", "bar");

  renderWithContext(<Preview />, {
    trackerContext: tracker,
    sliceContext: StubSliceContext as ContextProps,
    preloadedState: stubState,
  });

  expect(AnalyticsBrowser.standalone).toHaveBeenCalled();
  // @ts-expect-error
  expect(AnalyticsBrowser.track).toHaveBeenCalledWith("Slice Preview", {
    framework: "next",
    userId: "Marc",
    version: "0.2.0-alpha.17",
  });
});
