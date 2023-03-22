// @vitest-environment jsdom

import {
  describe,
  test,
  afterEach,
  beforeEach,
  expect,
  beforeAll,
  vi,
} from "vitest";
import Router from "next/router";
import mockRouter from "next-router-mock";
import SegmentClient from "analytics-node";
import { Frameworks } from "@lib/models/common/Framework";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

import pkg from "../../package.json";
import { render, fireEvent, act, screen, waitFor } from "../__testutils__";
import { createTestPlugin } from "../__testutils__/createTestPlugin";
import { createTestProject } from "../__testutils__/createTestProject";

import CreateCustomTypeBuilder from "../../pages/cts/[ct]";

vi.mock("next/router", () => import("next-router-mock"));

describe("Custom Type Builder", () => {
  beforeAll(async () => {
    const div = document.createElement("div");
    div.setAttribute("id", "__next");
    document.body.appendChild(div);
  });

  afterEach(() => {
    vi.clearAllMocks();
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
    const customTypeId = "a-page";

    Router.push({
      pathname: "cts/[ct]",
      query: { ct: customTypeId },
    });

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        // @ts-expect-error TS(2739) FIXME: Type '{ framework: Frameworks.next; mockConfig: { ... Remove this comment to see the full error message
        environment: {
          framework: Frameworks.next,
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
        // @ts-expect-error TS(2741) FIXME: Property 'remoteModel' is missing in type '{ model... Remove this comment to see the full error message
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
        },
        slices: {
          remoteSlices: [],
          // @ts-expect-error TS(2322) FIXME: Type '{ path: string; isLocal: boolean; name: stri... Remove this comment to see the full error message
          libraries: libraries,
        },
      },
    });

    const addButton = screen.getByText("Add a new field");
    fireEvent.click(addButton);

    const richText = screen.getByText("Rich Text");
    fireEvent.click(richText);

    const nameInput = screen.getByLabelText("label-input");
    fireEvent.change(nameInput, { target: { value: "New Field" } });

    const saveFieldButton = screen.getByText("Add");

    await act(async () => {
      fireEvent.click(saveFieldButton);
    });

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Custom Type Field Added",
        properties: {
          id: "new_field",
          name: "a-page",
          type: "StructuredText",
          zone: "static",
          nodeVersion: process.versions.node,
        },
      }),
      expect.any(Function)
    );
  });

  test("should send a tracking event when the user adds a slice", async () => {
    const customTypeId = "a-page";

    Router.push({
      pathname: "cts/[ct]",
      query: { ct: customTypeId },
    });

    // duplicated state for library context :/

    const environment = {
      framework: "next",
    };

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        // @ts-expect-error TS(2739) FIXME: Type '{ framework: string; mockConfig: { _cts: { "... Remove this comment to see the full error message
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
        // @ts-expect-error TS(2741) FIXME: Property 'remoteModel' is missing in type '{ model... Remove this comment to see the full error message
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
        },
        slices: {
          // @ts-expect-error TS(2322) FIXME: Type '{ path: string; isLocal: boolean; name: stri... Remove this comment to see the full error message
          libraries,
          remoteSlices: [],
        },
      },
    });

    const addButton = screen.getByText("Add a new Slice");
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

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Slicezone Updated",
        properties: { customTypeId, nodeVersion: process.versions.node },
      }),
      expect.any(Function)
    );
  });

  test("it should send a tracking event when the user saves a custom-type", async (ctx) => {
    const adapter = createTestPlugin({
      setup: ({ hook }) => {
        hook("custom-type:update", () => void 0);
      },
    });
    const cwd = await createTestProject({ adapter });
    const manager = createSliceMachineManager({
      nativePlugins: { [adapter.meta.name]: adapter },
      cwd,
    });

    await manager.telemetry.initTelemetry({
      appName: pkg.name,
      appVersion: pkg.version,
    });
    await manager.plugins.initPlugins();

    ctx.msw.use(
      createSliceMachineManagerMSWHandler({
        url: "http://localhost:3000/_manager",
        sliceMachineManager: manager,
      })
    );

    const customTypeId = "a-page";

    Router.push({
      pathname: "cts/[ct]",
      query: { ct: customTypeId },
    });

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        environment: {
          // @ts-expect-error TS(2322) FIXME: Type '"next"' is not assignable to type 'Framework... Remove this comment to see the full error message
          framework: "next",
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
        // @ts-expect-error TS(2741) FIXME: Property 'remoteModel' is missing in type '{ model... Remove this comment to see the full error message
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
        },
        slices: {
          // @ts-expect-error TS(2322) FIXME: Type '{ path: string; isLocal: boolean; name: stri... Remove this comment to see the full error message
          libraries: libraries,
          remoteSlices: [],
        },
      },
    });

    const addButton = screen.getByText("Add a new field");
    fireEvent.click(addButton);

    const richText = screen.getByText("Rich Text");
    fireEvent.click(richText);

    const nameInput = screen.getByLabelText("label-input");
    fireEvent.change(nameInput, { target: { value: "New Field" } });

    const saveFieldButton = screen.getByText("Add");

    await act(async () => {
      fireEvent.click(saveFieldButton);
    });

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Custom Type Field Added",
        properties: {
          id: "new_field",
          name: "a-page",
          type: "StructuredText",
          zone: "static",
          nodeVersion: process.versions.node,
        },
      }),
      expect.any(Function)
    );

    const saveCustomType = screen.getByText("Save to File System");

    await act(async () => {
      fireEvent.click(saveCustomType);
    });

    await waitFor(async () => {
      expect(SegmentClient.prototype.track).toHaveBeenCalledTimes(2);
      expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "SliceMachine Custom Type Saved",
          properties: {
            type: "repeatable",
            id: customTypeId,
            name: customTypeId,
            nodeVersion: process.versions.node,
          },
        }),
        expect.any(Function)
      );
    });
  });

  test("if saving fails a it should not send the save event", async (ctx) => {
    const adapter = createTestPlugin({
      setup: ({ hook }) => {
        hook("custom-type:update", () => {
          throw new Error("forced failure");
        });
      },
    });
    const cwd = await createTestProject({ adapter });
    const manager = createSliceMachineManager({
      nativePlugins: { [adapter.meta.name]: adapter },
      cwd,
    });

    await manager.telemetry.initTelemetry({
      appName: pkg.name,
      appVersion: pkg.version,
    });
    await manager.plugins.initPlugins();

    ctx.msw.use(
      createSliceMachineManagerMSWHandler({
        url: "http://localhost:3000/_manager",
        sliceMachineManager: manager,
      })
    );

    const customTypeId = "a-page";

    Router.push({
      pathname: "cts/[ct]",
      query: { ct: customTypeId },
    });

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        environment: {
          // @ts-expect-error TS(2322) FIXME: Type '"next"' is not assignable to type 'Framework... Remove this comment to see the full error message
          framework: "next",
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
        // @ts-expect-error TS(2741) FIXME: Property 'remoteModel' is missing in type '{ model... Remove this comment to see the full error message
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
        },
        slices: {
          // @ts-expect-error TS(2322) FIXME: Type '{ path: string; isLocal: boolean; name: stri... Remove this comment to see the full error message
          libraries,
          remoteSlices: [],
        },
      },
    });

    const addButton = screen.getByText("Add a new field");
    await act(async () => {
      fireEvent.click(addButton);
    });

    const richText = screen.getByText("Rich Text");
    await act(async () => {
      fireEvent.click(richText);
    });

    const nameInput = screen.getByLabelText("label-input");
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "New Field" } });
    });

    const saveFieldButton = screen.getByText("Add");

    await act(async () => {
      fireEvent.click(saveFieldButton);
    });

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Custom Type Field Added",
        properties: {
          id: "new_field",
          name: "a-page",
          type: "StructuredText",
          zone: "static",
          nodeVersion: process.versions.node,
        },
      }),
      expect.any(Function)
    );

    const saveCustomType = screen.getByText("Save to File System");

    await act(async () => {
      fireEvent.click(saveCustomType);
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
  });
});
