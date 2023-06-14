// @vitest-environment jsdom

import { describe, test, afterEach, expect, vi } from "vitest";
import SegmentClient from "analytics-node";

import { render, fireEvent, act } from "../__testutils__";
import { CreateCustomTypeModal } from "../../components/Forms/CreateCustomTypeModal";
import { ModalKeysEnum } from "../../src/modules/modal/types";

vi.mock("next/router", () => require("next-router-mock"));
global.console = { ...global.console, error: vi.fn() };

describe("CreateCustomTypeModal", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("when a slice is created the tracker should be called", async () => {
    const fakeId = "testing_id";
    const fakeName = "testing-name";
    const fakeRepo = "foo";

    render(<CreateCustomTypeModal format="custom" />, {
      preloadedState: {
        // @ts-expect-error TS(2739) FIXME: Type '{ repo: string; }' is missing the following ... Remove this comment to see the full error message
        environment: {
          repo: fakeRepo,
        },
        availableCustomTypes: {},
        // @ts-expect-error TS(2740) FIXME: Type '{ CREATE_CUSTOM_TYPE: true; }' is missing th... Remove this comment to see the full error message
        modal: { [ModalKeysEnum.CREATE_CUSTOM_TYPE]: true },
      },
    });

    const idInput = document.querySelector('[name="id"]');
    const labelInput = document.querySelector('[name="label"]');
    const submitButton = document.querySelector('[type="submit"]');

    await act(async () => {
      if (labelInput) {
        fireEvent.change(labelInput, { target: { value: fakeName } });
      }
    });

    await act(async () => {
      if (idInput) {
        fireEvent.change(idInput, { target: { value: fakeId } });
      }
    });

    await act(async () => {
      if (submitButton) {
        fireEvent.click(submitButton);
      }
    });

    expect(SegmentClient.prototype.track).toHaveBeenCalledOnce();
    expect(SegmentClient.prototype.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "SliceMachine Custom Type Created",
        properties: {
          id: fakeId,
          name: fakeName,
          format: "custom",
          type: "repeatable",
          nodeVersion: process.versions.node,
        },
      }),
      expect.any(Function)
    );
  });
});
