// @vitest-environment jsdom

import { Analytics } from "@segment/analytics-node";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import mockRouter from "next-router-mock";
import { createTestPlugin } from "../__testutils__/createTestPlugin";
import { createTestProject } from "../__testutils__/createTestProject";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import SlicesIndex from "@/pages/slices";

import pkg from "../../package.json";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "../__testutils__";

vi.mock("next/router", () => import("next-router-mock"));

describe("slices", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockRouter.setCurrentUrl("/slices");
  });

  test("When user creates a slice it should send a tracking event", async (ctx) => {
    const adapter = createTestPlugin({
      setup: ({ hook }) => {
        hook("slice:create", () => void 0);
        hook("slice:asset:update", () => void 0);
      },
    });
    const cwd = await createTestProject({
      adapter,
      libraries: ["slices"],
    });
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
      }),
    );

    const environment = {
      manifest: { apiEndpoint: "https://foo.cdn.prismic.io/api/v2" },
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

    render(<SlicesIndex />, {
      preloadedState: {
        availableCustomTypes: {},
        // @ts-expect-error TS(2739) FIXME: Type '{ framework: string; changelog: { currentVer... Remove this comment to see the full error message
        environment,
        slices: {
          // @ts-expect-error TS(2322) FIXME: Type '{ path: string; isLocal: boolean; name: stri... Remove this comment to see the full error message
          libraries,
          remoteSlices: [],
        },
      },
    });

    const createOneButton = await screen.findByTestId("create-slice");
    await act(async () => {
      fireEvent.click(createOneButton);
    });

    const nameInput = await screen.findByPlaceholderText(/slice api id/i);
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "FooBar" } });
    });

    const createSliceModal = screen.getByLabelText("Create a new slice");
    const submitButton = within(createSliceModal).getByText("Create");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => expect(Analytics.prototype.track).toHaveBeenCalled());

    expect(Analytics.prototype.track).toHaveBeenCalledOnce();
    expect(Analytics.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Slice Created",
        properties: {
          id: "FooBar",
          name: "FooBar",
          library: "slices",
          nodeVersion: process.versions.node,
        },
      }),
      expect.any(Function),
    );
  });

  test("if creation fails it sohuld not send the tracking event", async (ctx) => {
    const adapter = createTestPlugin({
      setup: ({ hook }) => {
        hook("slice:create", () => {
          throw new Error("forced failure");
        });
      },
    });
    const cwd = await createTestProject({
      adapter,
      libraries: ["slices"],
    });
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
      }),
    );

    const environment = {
      manifest: { apiEndpoint: "https://foo.cdn.prismic.io/api/v2" },
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

    render(<SlicesIndex />, {
      preloadedState: {
        availableCustomTypes: {},
        // @ts-expect-error TS(2739) FIXME: Type '{ framework: string; changelog: { currentVer... Remove this comment to see the full error message
        environment,
        slices: {
          // @ts-expect-error TS(2322) FIXME: Type '{ path: string; isLocal: boolean; name: stri... Remove this comment to see the full error message
          libraries,
          remoteSlices: [],
        },
      },
    });

    const createOneButton = screen.getByTestId("create-slice");
    await act(async () => {
      fireEvent.click(createOneButton);
    });

    const nameInput = await screen.findByTestId("slice-name-input");
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "FooBar" } });
    });

    const createSliceModal = screen.getByLabelText("Create a new slice");
    const submitButton = within(createSliceModal).getByText("Create");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(Analytics.prototype.track).not.toBeCalled();
  });
});
