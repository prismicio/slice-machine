// @vitest-environment jsdom
import { describe, vi, test, TestContext } from "vitest";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import mockRouter from "next-router-mock";

import {
  CustomTypeFormat,
  createSliceMachineManager,
} from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import { CustomTypes } from "@lib/models/common/CustomType";
import { render, screen, waitFor, within } from "test/__testutils__";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { CustomTypesBuilderPage } from "../customTypesBuilder/CustomTypesBuilderPage";
import pkg from "../../../../package.json";

import { createDynamicRouteParser } from "next-router-mock/dynamic-routes";

mockRouter.useParser(
  createDynamicRouteParser([
    "/page-types/[pageTypeId]",
    "/custom-types/[customTypeId]",
  ])
);

const formats = [
  {
    format: "custom",
  },
  {
    format: "page",
  },
];

vi.mock("next/router", () => import("next-router-mock"));

describe.each(formats)(
  "CustomTypeBuilderPage > All formats > $format type",
  (args) => {
    const format = args.format as CustomTypeFormat;

    test(`should delete a ${format} type from the dropdown`, async (ctx) => {
      const ctIndex = format === "custom" ? 0 : 1;
      const basePath = ["/custom-types", "/page-types"][ctIndex];
      const customType = customTypesMocks[ctIndex];

      await mockRouter.push(`${basePath}/${customType.id}`);
      const { user } = await renderCustomTypesBuilderPage({ ctx, customType });

      await user.click(screen.getByTestId("editDropdown"));
      await user.click(await screen.findByText("Remove"));
      expect(await screen.findByText(`Delete ${format} type`)).toBeVisible();
      await user.click(screen.getByRole("button", { name: "Delete" }));

      /** We should test route or toast message but I was not able to do it properly */
    });
    test(`should rename a ${format} type from the dropdown`, async (ctx) => {
      const ctIndex = format === "custom" ? 0 : 1;
      const basePath = ["/custom-types", "/page-types"][ctIndex];
      const customType = customTypesMocks[ctIndex];

      await mockRouter.push(`${basePath}/${customType.id}`);
      const { user } = await renderCustomTypesBuilderPage({ ctx, customType });

      await user.click(screen.getByTestId("editDropdown"));
      await user.click(await screen.findByText("Rename"));
      expect(await screen.findByText(`Rename a ${format} type`)).toBeVisible();

      // Scope the test to the modal
      const form = screen
        .getByText(`Rename a ${format} type`)
        .closest("form") as HTMLElement;

      // Get form input
      const renamedCustomType = `My renamed ${format} type`;
      const nameInput = within(form).getByPlaceholderText(
        `A display name for the ${format} type`
      );

      // Clear the name and type a new one
      await user.clear(nameInput);
      await user.type(nameInput, renamedCustomType);

      // Submit the form
      await user.click(screen.getByRole("button", { name: "Rename" }));

      const folder =
        customType.format === "page" ? "Page types" : "Custom types";
      expect(
        screen.getByTestId(`breadcrumb-${folder}-${renamedCustomType}`)
      ).toBeVisible();
    });
  }
);

describe("CustomTypesBuilderPage > Custom type", () => {
  test("should convert a custom type to page type from the dropdown", async (ctx) => {
    const customType = customTypesMocks[0];
    await mockRouter.push(`/custom-types/${customType.id}`);
    const { user } = await renderCustomTypesBuilderPage({ ctx, customType });

    // Click on the table row settings button
    await user.click(screen.getByTestId("editDropdown"));

    // Click on the convert to page type button
    await user.click(await screen.findByText("Convert to page type"));

    await waitFor(() =>
      expect(mockRouter.asPath).toEqual(`/page-types/${customType.id}`)
    );
  });
});

function createCustomTypeMock(format: CustomTypeFormat): CustomType {
  return {
    id: `MyID${format}`,
    label: `My ${format}`,
    repeatable: false,
    format,
    status: true,
    json: {},
  };
}

const customTypesMocks = [
  createCustomTypeMock("custom"),
  createCustomTypeMock("page"),
];

type RenderCustomTypesBuilderPageArgs = {
  ctx: TestContext;
  customType: CustomType;
};

async function renderCustomTypesBuilderPage({
  ctx,
  customType,
}: RenderCustomTypesBuilderPageArgs) {
  const adapter = createTestPlugin({
    setup: ({ hook }) => {
      hook("custom-type:create", () => void 0);
      hook("custom-type:update", () => void 0);
      hook("custom-type:rename", () => void 0);
      hook("custom-type:delete", () => void 0);
      hook("custom-type-library:read", () => {
        return { ids: customTypesMocks.map((customType) => customType.id) };
      });
      hook("custom-type:read", () => {
        return { model: customType };
      });
    },
  });
  const cwd = await createTestProject({
    adapter,
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

  const customTypeMockStore = {
    preloadedState: {
      availableCustomTypes: customTypesMocks.reduce(
        (obj, item) => ({
          ...obj,
          [item.id]: { local: CustomTypes.toSM(item) },
        }),
        {}
      ),
    },
  };

  const renderResults = render(<CustomTypesBuilderPage />, customTypeMockStore);

  const folder = customType.format === "page" ? "Page types" : "Custom types";
  expect(
    screen.getByTestId(`breadcrumb-${folder}-${customType.label as string}`)
  ).toBeVisible();

  return renderResults;
}
