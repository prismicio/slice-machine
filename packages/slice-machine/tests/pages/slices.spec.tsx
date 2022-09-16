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
import { render, fireEvent, act, screen, waitFor } from "../test-utils";
import mockRouter from "next-router-mock";
import { CreateSlice } from "../../src/tracking/types";
import { setupServer } from "msw/node";
import { rest, RestContext } from "msw";
import SlicesIndex from "../../pages/slices";
import * as ApiCalls from "@src/apiClient";
import { AxiosResponse } from "axios";

jest.mock("next/dist/client/router", () => require("next-router-mock"));

const server = setupServer(
  rest.post("/api/slices/create", (_, res, ctx) => {
    return res(
      ctx.json({
        screenshots: {},
        warning: null,
        variationId: "default",
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("slices", () => {
  beforeAll(async () => {
    const div = document.createElement("div");
    div.setAttribute("id", "__next");
    document.body.appendChild(div);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    mockRouter.setCurrentUrl("/slices");
  });

  test("When user creates a slice it should send a tracking event", async () => {
    const environment = {
      framework: "next",
      changelog: {
        currentVersion: "0.0.1",
      },
      mockConfig: { _cts: {} },
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
          },
        ],
      },
    ];

    const trackingSpy = jest.fn((_req: any, res: any, ctx: RestContext) => {
      return res(ctx.json({}));
    });

    server.use(rest.post<CreateSlice>("/api/s", trackingSpy));

    jest.spyOn(ApiCalls, "getState").mockResolvedValue({
      data: {
        env: environment,
        libraries: libraries,
        customTypes: [],
        remoteCustomTypes: [],
        remoteSlices: [],
      },
    } as AxiosResponse);

    const App = render(<SlicesIndex />, {
      preloadedState: {
        environment,
        slices: {
          libraries,
          remoteSlices: [],
        },
      },
    });

    const createOneButton = document.querySelector('[data-cy="create-slice"]');
    await act(async () => {
      fireEvent.click(createOneButton);
    });

    const nameInput = document.querySelector('[data-cy="slice-name-input"]');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "FooBar" } });
    });

    const submitButton = screen.getByText("Create");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => expect(trackingSpy).toHaveBeenCalled());

    expect(trackingSpy.mock.lastCall?.[0].body).toEqual({
      name: "SliceMachine Slice Created",
      props: { id: "FooBar", name: "FooBar", library: "slices" },
    });
  });
});
