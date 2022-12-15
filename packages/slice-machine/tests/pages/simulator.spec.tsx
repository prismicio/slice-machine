/**
 * @jest-environment jsdom
 **/

import "@testing-library/jest-dom";
import { render, fireEvent, act, waitFor } from "../test-utils";
import { setupServer } from "msw/node";
import { rest, ResponseComposition, RestContext, RestRequest } from "msw";
import { SliceSimulatorOpen } from "@src/tracking/types";
import mockRouter from "next-router-mock";
import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";

import Simulator from "../../pages/[lib]/[sliceName]/[variation]/simulator";
import { SliceMachineStoreType } from "@src/redux/type";
import { SaveMockBody } from "../../server/src/api/slices/save-mock";

jest.mock("next/dist/client/router", () => require("next-router-mock"));
mockRouter.useParser(
  createDynamicRouteParser(["/[lib]/[sliceName]/[variation]/simulator"])
);
// mock simulator client, it would be nice not to have to do this :/
jest.mock("@prismicio/slice-simulator-com", () => {
  return {
    SimulatorClient: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      connected: true,
      setSliceZone: jest.fn().mockResolvedValue(undefined),
    }),
  };
});

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("simulator", () => {
  beforeAll(async () => {
    const div = document.createElement("div");
    div.setAttribute("id", "__next");
    document.body.appendChild(div);

    // USE THIS IF light mode is not enabled on ThemeProvider
    // Object.defineProperty(window, "matchMedia", {
    //   writable: true,
    //   value: jest.fn().mockImplementation((query) => ({
    //     matches: false,
    //     media: query,
    //     onchange: null,
    //     addListener: jest.fn(), // Deprecated
    //     removeListener: jest.fn(), // Deprecated
    //     addEventListener: jest.fn(),
    //     removeEventListener: jest.fn(),
    //     dispatchEvent: jest.fn(),
    //   })),
    // });
  });

  document.createRange = () => {
    // https://github.com/jsdom/jsdom/issues/3002
    const range = new Range();

    range.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 0,
    });

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    };

    return range;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("save mock", async () => {
    jest.useFakeTimers();

    mockRouter.push("/slices/MySlice/default/simulator");
    const HEADING_TEXT = "HEADING TEXT";
    const state = {
      simulator: {
        isWaitingForIframeCheck: true,
        iframeStatus: null,
        setupStatus: { manifest: null },
        savingMock: false,
      },
      environment: {
        framework: "next",
        changelog: {
          currentVersion: "0.0.0",
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
                mock: [
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
                mockConfig: {},
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

    const trackingSpy = jest.fn((_req: any, res: any, ctx: RestContext) => {
      return res(ctx.json({}));
    });

    server.use(rest.post<SliceSimulatorOpen>("/api/s", trackingSpy));

    server.use(
      rest.get("/api/state", (_req, res, ctx) => {
        return res(
          ctx.json({
            env: state.environment,
            libraries: state.slices.libraries,
          })
        );
      })
    );

    server.use(
      rest.get(
        state.environment.manifest.localSliceSimulatorURL,
        (_req, res, ctx) => {
          return res(ctx.status(200));
        }
      )
    );

    const saveMockSpy = jest.fn(
      (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
        return req.json().then((json) => {
          const result = SaveMockBody.decode(json);
          if (result._tag === "Right") {
            return res(ctx.json(json.mock));
          }
          return res(ctx.status(400));
        });
      }
    );

    server.use(rest.post("http://localhost/api/slices/mock", saveMockSpy));
    server.use(
      rest.get(
        state.environment.manifest.localSliceSimulatorURL,
        (_req, res, ctx) => {
          res(ctx.json({}));
        }
      )
    );

    server.use(
      rest.get("http://localhost/api/simulator/check", (_req, res, ctx) => {
        return res(
          ctx.json({
            manifest: "ok",
            value: state.environment.manifest.localSliceSimulatorURL,
          })
        );
      })
    );

    const App = render(<Simulator />, {
      preloadedState: state as unknown as Partial<SliceMachineStoreType>,
    });

    await waitFor(() => expect(trackingSpy).toHaveBeenCalled());

    expect(trackingSpy.mock.lastCall?.[0].body).toEqual({
      name: "SliceMachine Slice Simulator Open",
      props: {
        version: state.environment.changelog.currentVersion,
        framework: state.environment.framework,
      },
    });

    const button = App.container.querySelector('[data-cy="save-mock"]');
    expect(button).not.toBeNull();

    const input = await App.getByText(HEADING_TEXT);
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

    expect(saveMockSpy).toHaveBeenCalled();
    const payloadSent = await saveMockSpy.mock.lastCall?.[0].body;

    const expectedMock = [...state.slices.libraries[0].components[0].mock];
    expectedMock[0].primary.title.value[0].content.text = "🎉";
    // @ts-expect-error
    expectedMock[0].primary.title.value[0].content.spans = [];
    // @ts-expect-error
    expectedMock[0].primary.title.value[0].direction = "ltr";

    expect(payloadSent).toEqual({
      sliceName: "MySlice",
      libraryName: "slices",
      mock: expectedMock,
    });
  }, 30000);
});
