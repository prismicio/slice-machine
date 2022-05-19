/**
 * @jest-environment jsdom
 **/

import "@testing-library/jest-dom";
import {
  jest,
  describe,
  test,
  afterEach,
  beforeEach,
  expect,
  beforeAll,
  afterAll,
} from "@jest/globals";
import React from "react";
import singletonRouter from "next/router";
import { render, fireEvent, act, screen, waitFor } from "../test-utils";
import mockRouter from "next-router-mock";
import { AnalyticsBrowser } from "@segment/analytics-next";
import Tracker from "../../src/tracker";
import LibrariesProvider from "../../src/models/libraries/context";
import { setupServer } from "msw/node";
import { rest } from "msw";
import SlicesIndex from "../../pages/slices";

jest.mock("next/dist/client/router", () => require("next-router-mock"));

const server = setupServer(
  rest.post("/api/slices/save", (_, res, ctx) => {
    return res(ctx.json({}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("slices", () => {
  const fakeTracker = jest.fn().mockImplementation(() => Promise.resolve());

  beforeAll(async () => {
    const div = document.createElement("div");
    div.setAttribute("id", "__next");
    document.body.appendChild(div);

    const fakeAnalytics = jest
      .spyOn(AnalyticsBrowser, "standalone")
      .mockResolvedValue({
        track: fakeTracker,
      } as any);

    await Tracker.get().initialize("foo", "repoName");
    expect(fakeAnalytics).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    mockRouter.setCurrentUrl("/slices");
  });

  test("When user creates a slice it should send a tracking event", () => {
    const environment = {
      framework: "next",
      mockConfig: { _cts: {} },
    };

    const libraries = [];

    const App = render(
      <LibrariesProvider
        env={environment}
        libraries={libraries}
        remoteSlices={[]}
      >
        <SlicesIndex />
      </LibrariesProvider>,
      {
        preloadedState: {
          environment,
          slices: {
            libraries,
            remoteSlices: [],
          },
        },
      }
    );

    App.debug();
  });
});
