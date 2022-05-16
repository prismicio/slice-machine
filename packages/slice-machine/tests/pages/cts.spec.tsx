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
} from "@jest/globals";
import React from "react";
import CreateCustomTypeBuilder from "../../pages/cts/[ct]";
import singletonRouter from "next/router";
import { render, fireEvent, act, screen } from "../test-utils";
import mockRouter from "next-router-mock";
import { AnalyticsBrowser } from "@segment/analytics-next";
import Tracker from "../../src/tracker";

jest.mock("next/dist/client/router", () => require("next-router-mock"));

describe("Custom Type Builder", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    mockRouter.setCurrentUrl("/");
  });

  const div = document.createElement("div");
  div.setAttribute("id", "__next");
  document.body.appendChild(div);

  test("should send a tracking event when the user adds a field", async () => {
    const fakeTracker = jest.fn().mockImplementation(() => Promise.resolve());
    const fakeAnalytics = jest
      .spyOn(AnalyticsBrowser, "standalone")
      .mockResolvedValue({
        track: fakeTracker,
      } as any);

    await Tracker.get().initialize("foo", "repoName");
    expect(fakeAnalytics).toHaveBeenCalled();

    const customTypeId = "a-page";

    singletonRouter.push({
      pathname: "cts/[ct]",
      query: { ct: customTypeId },
    });

    const App = render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        environment: {
          framework: "next",
          mockConfig: { _cts: { [customTypeId]: {} } },
        },
        availableCustomTypes: {
          [customTypeId]: {
            local: {
              id: customTypeId,
              label: customTypeId,
              repeatable: true,
              status: true,
              tabs: [
                {
                  key: "Main",
                  value: [],
                },
              ],
            },
          },
        },
        selectedCustomType: {
          model: {
            id: "a-page",
            label: "a-page",
            repeatable: true,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
          initialModel: {
            id: "a-page",
            label: "a-page",
            repeatable: true,
            status: true,
            tabs: [
              {
                key: "Main",
                value: [],
              },
            ],
          },
          mockConfig: {},
          initialMockConfig: {},
        },
      },
    });

    const addButton = screen.getByTestId("empty-zone-add-new-field");
    fireEvent.click(addButton);

    const uid = screen.getByText("UID");
    fireEvent.click(uid);

    const saveFieldButton = screen.getByText("Add");

    await act(async () => {
      fireEvent.click(saveFieldButton);
    });

    expect(fakeTracker).toHaveBeenCalledWith(
      "SliceMachine Custom Type Field Added",
      { id: "uid", name: "a-page", type: "UID", zone: "static" },
      { context: { groupId: { Repository: "repoName" } } }
    );
  });
});
