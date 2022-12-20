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
import Router from "next/router";
import { render, fireEvent, act, screen, waitFor } from "../test-utils";
import mockRouter from "next-router-mock";
import { setupServer } from "msw/node";
import { rest, RestContext } from "msw";
import { Frameworks } from "@slicemachine/core/build/models";

jest.mock("next/dist/client/router", () => require("next-router-mock"));

const server = setupServer(
  rest.post("/api/custom-types/save", (_, res, ctx) => {
    return res(ctx.json({}));
  })
);

const ResizeObserverMock = jest
  .fn<(fn: ResizeObserverCallback) => ResizeObserver>()
  .mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Custom Type Builder", () => {
  beforeAll(async () => {
    const div = document.createElement("div");
    div.setAttribute("id", "__next");
    document.body.appendChild(div);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    mockRouter.setCurrentUrl("/");
    window.ResizeObserver = ResizeObserverMock;
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
          screenshots: {},
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
        },
      ],
    },
  ];

  test("should send a tracking event when the user adds a field", async () => {
    const trackingSpy = jest.fn((_req: any, res: any, ctx: RestContext) => {
      return res(ctx.json({}));
    });
    server.use(rest.post("/api/s", trackingSpy));

    const customTypeId = "a-page";

    Router.push({
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

    expect(trackingSpy).toHaveBeenCalled();
    expect(trackingSpy.mock.lastCall?.[0].body).toEqual({
      name: "SliceMachine Custom Type Field Added",
      props: {
        id: "new_field",
        name: "a-page",
        type: "StructuredText",
        zone: "static",
      },
    });
  });

  test("should send a tracking event when the user adds a slice", async () => {
    const trackingSpy = jest.fn((_req: any, res: any, ctx: RestContext) => {
      return res(ctx.json({}));
    });
    server.use(rest.post("/api/s", trackingSpy));

    const customTypeId = "a-page";

    Router.push({
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

    expect(trackingSpy).toHaveBeenCalled();
    expect(trackingSpy.mock.lastCall?.[0].body).toEqual({
      name: "SliceMachine Slicezone Updated",
      props: { customTypeId },
    });
  });

  test("it should send a tracking event when the user saves a custom-type", async () => {
    const trackingSpy = jest.fn((_req: any, res: any, ctx: RestContext) => {
      return res(ctx.json({}));
    });
    server.use(rest.post("/api/s", trackingSpy));

    const customTypeId = "a-page";

    Router.push({
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

    expect(trackingSpy).toHaveBeenCalled();
    expect(trackingSpy.mock.lastCall?.[0].body).toEqual({
      name: "SliceMachine Custom Type Field Added",
      props: {
        id: "new_field",
        name: "a-page",
        type: "StructuredText",
        zone: "static",
      },
    });

    const saveCustomType = screen.getByText("Save to File System");

    await act(async () => {
      fireEvent.click(saveCustomType);
    });

    await waitFor(() =>
      expect(trackingSpy.mock.lastCall?.[0].body).toEqual({
        name: "SliceMachine Custom Type Saved",
        props: { type: "repeatable", id: customTypeId, name: customTypeId },
      })
    );
  });

  test("if saving fails a it should not send the save event", async () => {
    const trackingSpy = jest.fn((_req: any, res: any, ctx: RestContext) => {
      return res(ctx.json({}));
    });
    server.use(
      rest.post("/api/custom-types/save", (_, res, ctx) => {
        return res(ctx.status(500), ctx.json({}));
      }),
      rest.post("/api/s", trackingSpy)
    );
    const customTypeId = "a-page";

    Router.push({
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

    expect(trackingSpy.mock.lastCall?.[0].body).toEqual({
      name: "SliceMachine Custom Type Field Added",
      props: {
        id: "new_field",
        name: "a-page",
        type: "StructuredText",
        zone: "static",
      },
    });

    const saveCustomType = screen.getByText("Save to File System");

    await act(async () => {
      fireEvent.click(saveCustomType);
    });

    await new Promise((r) => setTimeout(r, 1000));

    expect(trackingSpy).toBeCalledTimes(1);
  });
});
