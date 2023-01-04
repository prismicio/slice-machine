// @vitest-environment jsdom

import { describe, test, afterEach, expect, vi } from "vitest";
import React from "react";
import { render, fireEvent, act } from "../__testutils__";
import CreateCustomTypeModal from "../../components/Forms/CreateCustomTypeModal";
import { ModalKeysEnum } from "../../src/modules/modal/types";
import { rest } from "msw";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

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
    const adapter = createTestPlugin();
    const cwd = await createTestProject({ adapter });
    const manager = createSliceMachineManager({
      nativePlugins: { [adapter.meta.name]: adapter },
      cwd,
    });

    await manager.plugins.initPlugins();

    ctx.msw.use(
      createSliceMachineManagerMSWHandler({
        url: "http://localhost:3000/_manager",
        sliceMachineManager: manager,
      })
    );

    const trackingSpy = vi.fn<Parameters<Parameters<typeof rest.post>[1]>>(
      (_req, res, ctx) => res(ctx.json({}))
    );
    ctx.msw.use(rest.post("/api/s", trackingSpy));

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

    expect(trackingSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: {
          name: "SliceMachine Custom Type Created",
          props: {
            id: fakeId,
            name: fakeName,
            type: "repeatable",
          },
        },
      }),
      expect.anything(),
      expect.anything()
    );
  });
});
