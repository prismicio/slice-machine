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
import { Frameworks } from "@slicemachine/core/build/models";

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

  test("should send a tracking event when the user adds a field", async () => {
    const customTypeId = "a-page";

    singletonRouter.push({
      pathname: "cts/[ct]",
      query: { ct: customTypeId },
    });

    const App = render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        environment: {
          framework: Frameworks.next,
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
        slices: {
          remoteSlices: [],
          libraries: libraries,
        },
      },
    });

    const addButton = screen.getByTestId("empty-zone-add-new-field");
    fireEvent.click(addButton);

    const richText = screen.getByText("Rich Text");
    fireEvent.click(richText);

    const nameInput = screen.getByLabelText("label-input");
    fireEvent.change(nameInput, { target: { value: "New Field" } });

    const saveFieldButton = screen.getByText("Add");

    await act(async () => {
      fireEvent.click(saveFieldButton);
    });

    expect(fakeTracker).toHaveBeenCalledWith(
      "SliceMachine Custom Type Field Added",
      {
        id: "new_field",
        name: "a-page",
        type: "StructuredText",
        zone: "static",
      },
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

    const App = render(<CreateCustomTypeBuilder />, {
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
    });

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

  test("it should send a tracking event when the user saves a custom-type", async () => {
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
        slices: {
          libraries: libraries,
          remoteSlices: [],
        },
      },
    });

    const addButton = screen.getByTestId("empty-zone-add-new-field");
    fireEvent.click(addButton);

    const richText = screen.getByText("Rich Text");
    fireEvent.click(richText);

    const nameInput = screen.getByLabelText("label-input");
    fireEvent.change(nameInput, { target: { value: "New Field" } });

    const saveFieldButton = screen.getByText("Add");

    await act(async () => {
      fireEvent.click(saveFieldButton);
    });

    expect(fakeTracker).toHaveBeenCalledWith(
      "SliceMachine Custom Type Field Added",
      {
        id: "new_field",
        name: "a-page",
        type: "StructuredText",
        zone: "static",
      },
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

  test("if saving fails a it should not send the save event", async () => {
    server.use(
      rest.post("/api/custom-types/save", (_, res, ctx) => {
        return res(ctx.status(500), ctx.json({}));
      })
    );
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
        slices: {
          libraries: libraries,
          remoteSlices: [],
        },
      },
    });

    const addButton = screen.getByTestId("empty-zone-add-new-field");
    fireEvent.click(addButton);

    const richText = screen.getByText("Rich Text");
    fireEvent.click(richText);

    const nameInput = screen.getByLabelText("label-input");
    fireEvent.change(nameInput, { target: { value: "New Field" } });

    const saveFieldButton = screen.getByText("Add");

    await act(async () => {
      fireEvent.click(saveFieldButton);
    });

    expect(fakeTracker).toHaveBeenCalledWith(
      "SliceMachine Custom Type Field Added",
      {
        id: "new_field",
        name: "a-page",
        type: "StructuredText",
        zone: "static",
      },
      { context: { groupId: { Repository: "repoName" } } }
    );

    const saveCustomType = screen.getByText("Save to File System");

    await act(async () => {
      fireEvent.click(saveCustomType);
    });

    await new Promise((r) => setTimeout(r, 1000));

    expect(fakeTracker).toHaveBeenCalledTimes(1);
  });

  test("when the user pushes a custom-type it should send a tracking event", async () => {
    const customTypeId = "a-page";

    server.use(
      rest.get("/api/custom-types/push", (req, res, ctx) => {
        expect(req.url.searchParams.get("id")).toEqual(customTypeId);
        return res(ctx.json({}));
      })
    );

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
        slices: {
          libraries: libraries,
          remoteSlices: [],
        },
      },
    });

    const pushButton = screen.getByText("Push to Prismic");
    await act(async () => {
      fireEvent.click(pushButton);
    });

    await waitFor(() => {
      expect(fakeTracker).toHaveBeenCalledWith(
        "SliceMachine Custom Type Pushed",
        { id: customTypeId, name: customTypeId, type: "repeatable" },
        { context: { groupId: { Repository: "repoName" } } }
      );
    });
  });
});
