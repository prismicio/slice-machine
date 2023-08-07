// @vitest-environment jsdom

import { describe, test, afterEach, beforeEach, expect, vi } from "vitest";
import mockRouter from "next-router-mock";
import SegmentClient from "analytics-node";

import pkg from "../../package.json";
import SlicesIndex from "../../pages/slices";

import {
  render,
  fireEvent,
  act,
  screen,
  waitFor,
  within,
} from "../__testutils__";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

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
      })
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

    const createOneButton = document.querySelector('[data-cy="create-slice"]');
    await act(async () => {
      if (createOneButton) {
        fireEvent.click(createOneButton);
      }
    });

    const nameInput = document.querySelector('[data-cy="slice-name-input"]');
    await act(async () => {
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: "FooBar" } });
      }
    });

    const createSliceModal = screen.getByLabelText("Create a new slice");
    const submitButton = within(createSliceModal).getByText("Create");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() =>
      expect(SegmentClient.prototype.track).toHaveBeenCalled()
    );

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Slice Created",
        properties: {
          id: "FooBar",
          name: "FooBar",
          library: "slices",
          nodeVersion: process.versions.node,
        },
      }),
      expect.any(Function)
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
      })
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

    const createOneButton = document.querySelector('[data-cy="create-slice"]');
    await act(async () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type 'Element | null' is not assignabl... Remove this comment to see the full error message
      fireEvent.click(createOneButton);
    });

    const nameInput = document.querySelector('[data-cy="slice-name-input"]');
    await act(async () => {
      // @ts-expect-error TS(2345) FIXME: Argument of type 'Element | null' is not assignabl... Remove this comment to see the full error message
      fireEvent.change(nameInput, { target: { value: "FooBar" } });
    });

    const createSliceModal = screen.getByLabelText("Create a new slice");
    const submitButton = within(createSliceModal).getByText("Create");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(SegmentClient.prototype.track).not.toBeCalled();
  });
});
