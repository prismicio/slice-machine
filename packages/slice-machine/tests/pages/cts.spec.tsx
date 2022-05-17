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
import CreateCustomTypeBuilder from "../../pages/cts/[ct]";
import singletonRouter from "next/router";
import { render, fireEvent, act, screen, waitFor } from "../test-utils";
import mockRouter from "next-router-mock";
import { AnalyticsBrowser } from "@segment/analytics-next";
import Tracker from "../../src/tracker";
import LibrariesProvider from "../../src/models/libraries/context";
import { setupServer } from "msw/node";
import { rest } from "msw";

jest.mock("next/dist/client/router", () => require("next-router-mock"));

const server = setupServer(
  rest.post("/api/custom-types/save", (_, res, ctx) => {
    return res(ctx.json({}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Custom Type Builder", () => {
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
    mockRouter.setCurrentUrl("/");
  });

  test("should send a tracking event when the user adds a field", async () => {
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

  test("should send a tracking event when the user adds a slice", async () => {
    const customTypeId = "a-page";

    singletonRouter.push({
      pathname: "cts/[ct]",
      query: { ct: customTypeId },
    });

    // duplicated state for library context :/

    const environment = {
      framework: "next",
      mockConfig: { _cts: { [customTypeId]: {} } },
    };

    const libraries = [
      {
        path: "./slices",
        isLocal: true,
        name: "slices",
        meta: {
          isNodeModule: false,
          isDownloaded: false,
          isManual: true,
        },
        components: [
          {
            from: "slices",
            href: "slices",
            pathToSlice: "./slices",
            fileName: "index",
            extension: "js",
            screenshotPaths: {},
            mock: [
              {
                variation: "default",
                name: "Default",
                slice_type: "test_slice",
                items: [],
                primary: {
                  title: [
                    {
                      type: "heading1",
                      text: "Cultivate granular e-services",
                      spans: [],
                    },
                  ],
                  description: [
                    {
                      type: "paragraph",
                      text: "Anim in commodo exercitation qui. Elit cillum officia mollit dolore. Commodo voluptate sit est proident ea proident dolor esse ad.",
                      spans: [],
                    },
                  ],
                },
              },
            ],
            model: {
              id: "test_slice",
              type: "SharedSlice",
              name: "TestSlice",
              description: "TestSlice",
              variations: [
                {
                  id: "default",
                  name: "Default",
                  docURL: "...",
                  version: "sktwi1xtmkfgx8626",
                  description: "TestSlice",
                  primary: [
                    {
                      key: "title",
                      value: {
                        type: "StructuredText",
                        config: {
                          single: "heading1",
                          label: "Title",
                          placeholder: "This is where it all begins...",
                        },
                      },
                    },
                    {
                      key: "description",
                      value: {
                        type: "StructuredText",
                        config: {
                          single: "paragraph",
                          label: "Description",
                          placeholder: "A nice description of your feature",
                        },
                      },
                    },
                  ],
                  items: [],
                  imageUrl:
                    "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
                },
              ],
            },
            screenshotUrls: {},
            __status: "NEW_SLICE",
          },
        ],
      },
    ];

    const App = render(
      <LibrariesProvider
        env={environment}
        libraries={libraries}
        remoteSlices={[]}
      >
        <CreateCustomTypeBuilder />
      </LibrariesProvider>,
      {
        preloadedState: {
          environment,
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
          slices: {
            libraries,
            remoteSlices: [],
          },
        },
      }
    );

    const addButton = screen.getByTestId("empty-zone-add-a-new-slice");
    await act(async () => {
      fireEvent.click(addButton);
    });

    const slicesToSelect = screen.getAllByTestId("slicezone-modal-item");

    for (const elem of slicesToSelect) {
      await act(async () => {
        fireEvent.click(elem);
      });
    }

    const saveButton = screen.getByText("Save");

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(fakeTracker).toHaveBeenCalledWith(
      "SliceMachine Slicezone Updated",
      { customTypeId },
      { context: { groupId: { Repository: "repoName" } } }
    );
  });

  test("it should sendd a tracking event when the user saves a custoom-type", async () => {
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
      { id: "uid", name: customTypeId, type: "UID", zone: "static" },
      { context: { groupId: { Repository: "repoName" } } }
    );

    const saveCustomType = screen.getByText("Save to File System");

    await act(async () => {
      fireEvent.click(saveCustomType);
    });

    await waitFor(() => {
      expect(fakeTracker).toHaveBeenLastCalledWith(
        "SliceMachine Custom Type Saved",
        { type: "repeatable", id: customTypeId, name: customTypeId },
        { context: { groupId: { Repository: "repoName" } } }
      );
    });
  });
});
