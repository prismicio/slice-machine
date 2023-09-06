// @vitest-environment jsdom

import { describe, test, afterEach, beforeEach, expect, vi } from "vitest";
import Router from "next/router";
import mockRouter from "next-router-mock";
import SegmentClient from "analytics-node";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

import pkg from "../../package.json";
import {
  render,
  fireEvent,
  act,
  screen,
  waitFor,
  within,
} from "../__testutils__";
import { createTestPlugin } from "../__testutils__/createTestPlugin";
import { createTestProject } from "../__testutils__/createTestProject";

import CreateCustomTypeBuilder from "../../pages/custom-types/[customTypeId]";

vi.mock("next/router", () => import("next-router-mock"));

describe("Custom Type Builder", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
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
          mocks: [
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

    void Router.push({
      pathname: "custom-types/[customTypeId]",
      query: { customTypeId },
    });

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        availableCustomTypes: {
          [customTypeId]: {
            local: {
              id: customTypeId,
              label: customTypeId,
              repeatable: true,
              format: "custom",
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
        // @ts-expect-error TS2739: Type '{ manifest: { apiEndpoint: string; }; }' is missing the following properties from type 'FrontEndEnvironment': repo, packageManager, supportsSliceSimulator, endpoints
        environment: {
          manifest: { apiEndpoint: "https://foo.cdn.prismic.io/api/v2" },
        },
        // @ts-expect-error TS(2741) FIXME: Property 'remoteModel' is missing in type '{ model... Remove this comment to see the full error message
        selectedCustomType: {
          model: {
            id: "a-page",
            label: "a-page",
            repeatable: true,
            format: "custom",
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
            format: "custom",
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

    const addButton = await screen.findByText("Add a new field");
    fireEvent.click(addButton);

    const richText = screen.getByText("Rich Text");
    fireEvent.click(richText);

    const nameInput = screen.getByLabelText("label-input");
    fireEvent.change(nameInput, { target: { value: "New Field" } });

    const saveFieldButton = screen.getByText("Add");

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      fireEvent.click(saveFieldButton);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/unbound-method
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

    void Router.push({
      pathname: "custom-types/[customTypeId]",
      query: { customTypeId },
    });

    // duplicated state for library context :/

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        availableCustomTypes: {
          [customTypeId]: {
            local: {
              id: customTypeId,
              label: customTypeId,
              repeatable: true,
              status: true,
              format: "custom",
              tabs: [
                {
                  key: "Main",
                  value: [],
                  sliceZone: {
                    key: "slices",
                    value: [],
                  },
                },
              ],
            },
          },
        },
        // @ts-expect-error TS2739: Type '{ manifest: { apiEndpoint: string; }; }' is missing the following properties from type 'FrontEndEnvironment': repo, packageManager, supportsSliceSimulator, endpoints
        environment: {
          manifest: { apiEndpoint: "https://foo.cdn.prismic.io/api/v2" },
        },
        // @ts-expect-error TS(2741) FIXME: Property 'remoteModel' is missing in type '{ model... Remove this comment to see the full error message
        selectedCustomType: {
          model: {
            id: "a-page",
            label: "a-page",
            repeatable: true,
            status: true,
            format: "custom",
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
            format: "custom",
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

    const addButton = screen.getByText("Add from libraries");
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      fireEvent.click(addButton);
    });

    const slicesToSelect = screen.getAllByTestId("slicezone-modal-item");

    for (const elem of slicesToSelect) {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await act(() => {
        fireEvent.click(elem);
      });
    }

    const saveButton = within(screen.getByRole("dialog")).getByText("Apply");

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      fireEvent.click(saveButton);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Slicezone Updated",
        properties: { customTypeId, nodeVersion: process.versions.node },
      }),
      expect.any(Function)
    );
  });

  // FIXME: events happening out of order
  test.skip("it should send a tracking event when the user saves a custom-type", async (ctx) => {
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

    void Router.push({
      pathname: "custom-types/[customTypeId]",
      query: { customTypeId },
    });

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        availableCustomTypes: {
          [customTypeId]: {
            local: {
              id: customTypeId,
              label: customTypeId,
              repeatable: true,
              status: true,
              format: "custom",
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
            format: "custom",
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
            format: "custom",
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

    act(() => {
      fireEvent.click(saveFieldButton);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/unbound-method
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

    const saveCustomType = screen.getByTestId("builder-save-button");

    act(() => {
      fireEvent.click(saveCustomType);
    });

    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(SegmentClient.prototype.track).toHaveBeenCalledTimes(2);
      // eslint-disable-next-line @typescript-eslint/unbound-method
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

    void Router.push({
      pathname: "custom-types/[customTypeId]",
      query: { customTypeId },
    });

    render(<CreateCustomTypeBuilder />, {
      preloadedState: {
        availableCustomTypes: {
          [customTypeId]: {
            local: {
              id: customTypeId,
              label: customTypeId,
              repeatable: true,
              status: true,
              format: "custom",
              tabs: [
                {
                  key: "Main",
                  value: [],
                },
              ],
            },
          },
        },
        // @ts-expect-error TS2739: Type '{ manifest: { apiEndpoint: string; }; }' is missing the following properties from type 'FrontEndEnvironment': repo, packageManager, supportsSliceSimulator, endpoints
        environment: {
          manifest: { apiEndpoint: "https://foo.cdn.prismic.io/api/v2" },
        },
        // @ts-expect-error TS(2741) FIXME: Property 'remoteModel' is missing in type '{ model... Remove this comment to see the full error message
        selectedCustomType: {
          model: {
            id: "a-page",
            label: "a-page",
            repeatable: true,
            status: true,
            format: "custom",
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
            format: "custom",
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
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      fireEvent.click(addButton);
    });

    const richText = screen.getByText("Rich Text");
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      fireEvent.click(richText);
    });

    const nameInput = screen.getByLabelText("label-input");
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      fireEvent.change(nameInput, { target: { value: "New Field" } });
    });

    const saveFieldButton = screen.getByText("Add");
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await act(() => {
      fireEvent.click(saveFieldButton);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/unbound-method
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

    const saveCustomType = screen.getByTestId("builder-save-button");

    act(() => {
      fireEvent.click(saveCustomType);
    });

    await new Promise((r) => setTimeout(r, 500));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
  });
});
