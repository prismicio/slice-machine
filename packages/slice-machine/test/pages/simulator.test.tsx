// @vitest-environment jsdom

import { describe, test, afterEach, expect, beforeAll, vi } from "vitest";
import { render, fireEvent, act, waitFor } from "../__testutils__";
import mockRouter from "next-router-mock";
import router from "next/router";
import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";
import SegmentClient from "analytics-node";

import pkg from "../../package.json";
import Simulator from "../../pages/[lib]/[sliceName]/[variation]/simulator";
import { SliceMachineStoreType } from "@src/redux/type";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

vi.mock("next/router", () => require("next-router-mock"));
vi.mock("next/dist/client/router", () => require("next-router-mock"));
mockRouter.useParser(
  createDynamicRouteParser(["/[lib]/[sliceName]/[variation]/simulator"])
);
// mock simulator client, it would be nice not to have to do this :/
vi.mock("@prismicio/simulator", () => {
  return {
    SimulatorClient: vi.fn().mockReturnValue({
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn(),
      connected: true,
      setSliceZone: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

describe.skip("simulator", () => {
  beforeAll(async () => {
    // USE THIS IF light mode is not enabled on ThemeProvider
    // Object.defineProperty(window, "matchMedia", {
    //   writable: true,
    //   value: vi.fn().mockImplementation((query) => ({
    //     matches: false,
    //     media: query,
    //     onchange: null,
    //     addListener: vi.fn(), // Deprecated
    //     removeListener: vi.fn(), // Deprecated
    //     addEventListener: vi.fn(),
    //     removeEventListener: vi.fn(),
    //     dispatchEvent: vi.fn(),
    //   })),
    // });
  });

  document.createRange = () => {
    // https://github.com/jsdom/jsdom/issues/3002
    const range = new Range();

    range.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 0,
    });

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: vi.fn(),
      };
    };

    return range;
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("save mock", async (ctx) => {
    const adapter = createTestPlugin({
      setup: ({ hook }) => {
        hook("slice:asset:update", () => void 0);
        hook("slice-simulator:setup:read", () => {
          return [];
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

    vi.useFakeTimers();

    router.push("/slices/MySlice/default/simulator");
    const HEADING_TEXT = "HEADING TEXT";
    const state = {
      simulator: {
        isWaitingForIframeCheck: true,
        iframeStatus: null,
        setupStatus: { manifest: null },
        savingMock: false,
      },
      environment: {
        changelog: {
          sliceMachine: {
            currentVersion: "0.0.0",
          },
        },
        manifest: {
          localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
        },
      },
      slices: {
        libraries: [
          {
            path: "../../e2e-projects/next/slices2",
            isLocal: true,
            name: "slices",
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
                    __TYPE__: "SharedSliceContent",
                    variation: "default",
                    primary: {
                      title: {
                        __TYPE__: "StructuredTextContent",
                        value: [
                          {
                            type: "heading1",
                            content: {
                              text: HEADING_TEXT,
                            },
                          },
                        ],
                      },
                      description: {
                        __TYPE__: "StructuredTextContent",
                        value: [
                          {
                            type: "paragraph",
                            content: {
                              text: "Et irure id id ea exercitation excepteur consectetur. Ea amet irure minim labore non aliquip ex. Tempor incididunt Lorem incididunt amet est cillum nisi Lorem officia pariatur exercitation in occaecat sit.",
                            },
                          },
                        ],
                      },
                    },
                    items: [
                      {
                        __TYPE__: "GroupItemContent",
                        value: [],
                      },
                    ],
                  },
                ],
                model: {
                  id: "my_slice",
                  type: "SharedSlice",
                  name: "MySlice",
                  description: "MySlice",
                  variations: [
                    {
                      id: "default",
                      name: "Default",
                      docURL: "...",
                      version: "sktwi1xtmkfgx8626",
                      description: "MySlice",
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
                    },
                  ],
                },
              },
            ],
            meta: {
              isNodeModule: false,
              isDownloaded: false,
              isManual: true,
            },
          },
        ],
      },
    };

    // server.use(
    //   rest.get("/api/state", (_req, res, ctx) => {
    //     return res(
    //       ctx.json({
    //         env: state.environment,
    //         libraries: state.slices.libraries,
    //       })
    //     );
    //   })
    // );
    //
    // server.use(
    //   rest.get(
    //     state.environment.manifest.localSliceSimulatorURL,
    //     (_req, res, ctx) => {
    //       return res(ctx.status(200));
    //     }
    //   )
    // );
    //
    // const saveMockSpy = vi.fn(
    //   (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    //     return req.json().then((json) => {
    //       const result = SaveMockBody.decode(json);
    //       if (result._tag === "Right") {
    //         return res(ctx.json(json.mock));
    //       }
    //       return res(ctx.status(400));
    //     });
    //   }
    // );
    //
    // server.use(rest.post("http://localhost/api/slices/mock", saveMockSpy));
    // server.use(
    //   rest.get(
    //     state.environment.manifest.localSliceSimulatorURL,
    //     (_req, res, ctx) => {
    //       res(ctx.json({}));
    //     }
    //   )
    // );
    //
    // server.use(
    //   rest.get("http://localhost/api/simulator/check", (_req, res, ctx) => {
    //     return res(
    //       ctx.json({
    //         manifest: "ok",
    //         value: state.environment.manifest.localSliceSimulatorURL,
    //       })
    //     );
    //   })
    // );

    const App = render(<Simulator />, {
      preloadedState: state as unknown as Partial<SliceMachineStoreType>,
    });

    await waitFor(() =>
      expect(SegmentClient.prototype.track).toHaveBeenCalled()
    );

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Slice Simulator Open",
        properties: {
          version: state.environment.changelog.sliceMachine.currentVersion,
        },
      }),
      expect.any(Function)
    );

    const button = App.container.querySelector('[data-cy="save-mock"]');
    expect(button).not.toBeNull();

    const input = App.getByText(HEADING_TEXT);
    expect(input).not.toBeNull();

    await act(async () => {
      // fireEvent.change(input as Element, {target: {value: "🎉"}})
      // see: https://github.com/testing-library/dom-testing-library/pull/235
      fireEvent.blur(input as Element, { target: { textContent: "🎉" } });
    });

    expect(button).not.toHaveAttribute("disabled");

    await act(async () => {
      fireEvent.click(button as Element);
    });

    const expectedMock = [...state.slices.libraries[0].components[0].mocks];
    expectedMock[0].primary.title.value[0].content.text = "🎉";
    // @ts-expect-error - Ignoring wrong type
    expectedMock[0].primary.title.value[0].content.spans = [];
    // @ts-expect-error - Ignoring wrong type
    expectedMock[0].primary.title.value[0].direction = "ltr";

    expect(SegmentClient.prototype.track).toHaveBeenCalledTimes(2);
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        sliceName: "MySlice",
        libraryName: "slices",
        mocks: expectedMock,
      }),
      expect.any(Function)
    );
  });
});
