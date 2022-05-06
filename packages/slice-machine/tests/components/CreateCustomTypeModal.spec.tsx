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
import { rest } from "msw";
import { AnalyticsBrowser } from "@segment/analytics-next";
import Tracker from "../../src/tracker";

jest.mock("next/dist/client/router", () => require("next-router-mock"));

const server = setupServer(
  rest.post("/api/custom-types/save", (_, res, ctx) => {
    return res(ctx.json({}));
  })
);

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
    const fakeTracker = jest.fn().mockImplementation(() => Promise.resolve());
    const fakeAnalytics = jest
      .spyOn(AnalyticsBrowser, "standalone")
      .mockResolvedValue({
        track: fakeTracker,
      } as any);

    // will have to assume tracker is initialized?
    await Tracker.get().initialize("foo");

    expect(fakeAnalytics).toHaveBeenCalled();

    const fakeId = "testing-id";
    const fakeName = "testing-name";
    const fakeRepo = "foo";

    const App = await render(<CreateCustomTypeModal />, {
      preloadedState: {
        environment: {
          repo: "foo",
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

    expect(fakeTracker).toHaveBeenCalledWith(
      "SliceMachine Custom Type Created",
      { id: fakeId, name: fakeName, type: "repeatable", repo: fakeRepo }
    );
  });
});
