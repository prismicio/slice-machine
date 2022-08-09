/**
 * @jest-environment jsdom
 **/

import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import React from "react";
import { render, fireEvent, act } from "../test-utils";
import CreateCustomTypeModal from "../../components/Forms/CreateCustomTypeModal";
import { ModalKeysEnum } from "../../src/modules/modal/types";
import { setupServer } from "msw/node";
import { rest, RestContext } from "msw";

jest.mock("next/dist/client/router", () => require("next-router-mock"));
global.console = { ...global.console, error: jest.fn() };

const server = setupServer(
  rest.post("/api/custom-types/save", (_, res, ctx) => {
    return res(ctx.json({}));
  })
);

const makeTrackerSpy = () =>
  jest.fn((_req: any, res: any, ctx: RestContext) => {
    return res(ctx.json({}));
  });

const interceptTracker = (spy: ReturnType<typeof makeTrackerSpy>) =>
  server.use(rest.post("/api/s", spy));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CreateCustomTypeModal", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const div = document.createElement("div");
  div.setAttribute("id", "__next");
  document.body.appendChild(div);

  test("when a slice is created the tracker should be called", async () => {
    const fakeId = "testing_id";
    const fakeName = "testing-name";
    const fakeRepo = "foo";

    const fakeTracker = makeTrackerSpy();
    interceptTracker(fakeTracker);

    const App = await render(<CreateCustomTypeModal />, {
      preloadedState: {
        environment: {
          repo: fakeRepo,
        },
        availableCustomTypes: {},
        modal: { [ModalKeysEnum.CREATE_CUSTOM_TYPE]: true },
      },
    });

    const idInput = document.querySelector('[name="id"]');
    const labelInput = document.querySelector('[name="label"]');
    const submitButton = document.querySelector('[type="submit"]');

    await act(async () => {
      fireEvent.change(labelInput, { target: { value: fakeName } });
    });

    await act(async () => {
      fireEvent.change(idInput, { target: { value: fakeId } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(fakeTracker.mock.lastCall?.[0].body).toEqual({
      name: "SliceMachine Custom Type Created",
      props: {
        id: fakeId,
        name: fakeName,
        type: "repeatable",
      },
    });
  });
});
