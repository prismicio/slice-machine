// @vitest-environment jsdom

import { describe, test, afterEach, expect, vi } from "vitest";
import React from "react";
import { rest } from "msw";
import SegmentClient from "analytics-node";

import { render, fireEvent, act } from "../__testutils__";
import CreateCustomTypeModal from "../../components/Forms/CreateCustomTypeModal";
import { ModalKeysEnum } from "../../src/modules/modal/types";

vi.mock("next/router", () => require("next-router-mock"));
global.console = { ...global.console, error: vi.fn() };

describe("CreateCustomTypeModal", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const div = document.createElement("div");
  div.setAttribute("id", "__next");
  document.body.appendChild(div);

  test("when a slice is created the tracker should be called", async (ctx) => {
    const fakeId = "testing_id";
    const fakeName = "testing-name";
    const fakeRepo = "foo";

    render(<CreateCustomTypeModal />, {
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

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Custom Type Created",
        properties: {
          id: fakeId,
          name: fakeName,
          type: "repeatable",
        },
      }),
      expect.any(Function)
    );
  });
});
